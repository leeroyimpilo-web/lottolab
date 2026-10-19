"""LottoLab feed gateway. Python 3.11+, standard library only.
Start: python server.py; connect Android with -PfeedBaseUrl=https://HOST/api/v1/lotto/
No credentials are shipped to Android. RESULTSZA_API_KEY is optional server-side.
"""
import datetime as dt
import hashlib
import json
import os
import sqlite3
import threading
import time
import urllib.request
import urllib.parse
from decimal import Decimal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT=Path(os.environ.get('LOTTO_DATA_DIR',str(Path(__file__).parent/'data')))
CUTOFF='2026-06-01'
GAMES={'lotto','lotto-plus-1','lotto-5-max','lotto-plus-2','powerball','powerball-plus','powerball-xtra','daily-lotto','daily-lotto-plus'}

def canonical(game,date):
    if date>=CUTOFF:
        return {'lotto-plus-2':'lotto-5-max','powerball-plus':'powerball-xtra'}.get(game,game)
    return game

def validate(row):
    date=row['date'];dt.date.fromisoformat(date)
    if date>dt.datetime.now(dt.timezone(dt.timedelta(hours=2))).date().isoformat():raise ValueError('Future draw')
    game=canonical(row['game'],date)
    if game not in GAMES:raise ValueError('Unsupported game')
    current=date>=CUTOFF
    if game.startswith('powerball'):
        if date<'2015-11-28':raise ValueError('Historical rules not confirmed')
        count,maximum,special=5,50,16 if current else 20
        era='powerball-2026' if current else 'powerball-2015'
    elif game.startswith('daily'):
        if date<'2019-03-10' or game=='daily-lotto-plus' and (current or date<'2025-09-21'):raise ValueError('Inactive game')
        count,maximum,special=5,36,0;era='daily-2026' if current else ('daily-plus-2025' if game=='daily-lotto-plus' else 'daily-legacy')
    else:
        if date<'2000-03-11':raise ValueError('Inactive game')
        if game=='lotto-plus-1' and date<'2003-11-26':raise ValueError('Inactive game')
        if game=='lotto-plus-2' and date<'2017-07-30':raise ValueError('Inactive game')
        maximum=52 if current else 58 if date>='2025-09-21' else 52 if date>='2017-07-30' else 49
        count,special=6,-1;era='lotto-2026' if current else 'lotto-2025' if maximum==58 else 'lotto-2017' if maximum==52 else 'lotto-original'
    numbers=row['numbers'];bonus=row.get('bonusBall')
    if len(numbers)!=count or len(set(numbers))!=count or any(type(n)!=int or not 1<=n<=maximum for n in numbers):raise ValueError('Invalid main numbers')
    if special>0 and (type(bonus)!=int or not 1<=bonus<=special):raise ValueError('Invalid PowerBall')
    if special==-1 and (type(bonus)!=int or not 1<=bonus<=maximum or bonus in numbers):raise ValueError('Invalid bonus')
    if special==0 and bonus is not None:raise ValueError('Unexpected bonus')
    return dict(row,game=game,numbers=sorted(numbers),ruleVersion=era,verificationStatus='provider-published')

def connect():
    ROOT.mkdir(parents=True,exist_ok=True)
    con=sqlite3.connect(ROOT/'lotto.sqlite3',timeout=30)
    con.execute('PRAGMA journal_mode=WAL')
    con.executescript('''CREATE TABLE IF NOT EXISTS draws(id TEXT PRIMARY KEY,game TEXT,date TEXT,body TEXT,updated TEXT,revision INTEGER);
    CREATE TABLE IF NOT EXISTS payouts(id TEXT PRIMARY KEY,body TEXT);
    CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY,draw_id TEXT,body TEXT,changed TEXT);
    CREATE TABLE IF NOT EXISTS quarantine(id INTEGER PRIMARY KEY,body TEXT,reason TEXT,observed TEXT);
    CREATE TABLE IF NOT EXISTS sync_log(id INTEGER PRIMARY KEY,at TEXT,accepted INTEGER,rejected INTEGER,status TEXT);''')
    return con

def fetch(url):
    request=urllib.request.Request(url,headers={'User-Agent':'LottoLabNext/1.0','Accept':'application/json'})
    with urllib.request.urlopen(request,timeout=60) as response:return json.load(response)

def ingest(rows,payouts,source='BetTip'):
    now=dt.datetime.now(dt.timezone.utc).isoformat();accepted=rejected=0
    fingerprints={};blocked=set()
    for item in rows:
        try:
            key=canonical(item['game'],item['date'])+':'+item['date']
            fingerprint=(tuple(sorted(item['numbers'])),item.get('bonusBall'))
            if key in fingerprints and fingerprints[key]!=fingerprint:blocked.add(key)
            fingerprints[key]=fingerprint
        except (KeyError,TypeError):pass
    with connect() as con:
        for item in rows:
            try:
                row=validate(item);row['provider']=source;key=row['game']+':'+row['date']
                if key in blocked:raise ValueError('Conflicting duplicate in feed')
                body=json.dumps(row,sort_keys=True)
                old=con.execute('SELECT body,revision FROM draws WHERE id=?',(key,)).fetchone()
                revision=1 if not old else old[1]
                if old and old[0]!=body:
                    con.execute('INSERT INTO revisions(draw_id,body,changed) VALUES(?,?,?)',(key,old[0],now));revision+=1
                con.execute('INSERT OR REPLACE INTO draws VALUES(?,?,?,?,?,?)',(key,row['game'],row['date'],body,now,revision));accepted+=1
            except (ValueError,KeyError,TypeError) as error:
                con.execute('INSERT INTO quarantine(body,reason,observed) VALUES(?,?,?)',(json.dumps(item),str(error),now));rejected+=1
        for p in payouts:
            try:
                date=p['date'];game=canonical(p['game'],date);key=game+':'+date
                if not con.execute('SELECT 1 FROM draws WHERE id=?',(key,)).fetchone():continue
                # Missing/null payout stays missing. A source's zero-winner jackpot is not a payable prize.
                for division in p['divisions']:
                    if division.get('prize') is not None and Decimal(str(division['prize']))<0:raise ValueError('Negative prize')
                con.execute('INSERT OR REPLACE INTO payouts VALUES(?,?)',(key,json.dumps(dict(p,game=game))))
            except (KeyError,ValueError,TypeError):rejected+=1
        con.execute('INSERT INTO sync_log(at,accepted,rejected,status) VALUES(?,?,?,?)',(now,accepted,rejected,'complete'))
    return accepted,rejected

def resultsza():
    key=os.environ.get('RESULTSZA_API_KEY')
    if not key:return
    data=fetch('https://resultsza.co.za/api/get_lotto_5_max_results?'+urllib.parse.urlencode({'api_key':key}))
    rows=[];payouts=[]
    for r in data.get('results',[]):
        date=r['draw_date'][:10];game='lotto-5-max'
        rows.append({'game':game,'date':date,'numbers':r['winning_numbers'],'bonusBall':r.get('bonus_ball'),'sourceUrl':'https://resultsza.co.za/'})
        payouts.append({'game':game,'date':date,'divisions':[{'matched':d['match'],'prize':d.get('winning_amount'),'winners':d.get('winners')} for d in r.get('divisions',[])]})
    ingest(rows,payouts,'ResultsZA')

def refresh(full=True):
    base='https://bettip.co.za/api/v1/lotto/'
    data=fetch(base+('draws.json' if full else 'latest.json'))['data']
    rows=data if isinstance(data,list) else list(data['byGame'].values())
    try:payouts=fetch(base+'payouts.json')['data']
    except Exception:payouts=[]
    counts=ingest(rows,payouts)
    resultsza()
    return counts

def payload(resource,since=''):
    with connect() as con:
        if resource=='health':
            return {'draws':con.execute('SELECT COUNT(*) FROM draws').fetchone()[0],'latestByGame':dict(con.execute('SELECT game,MAX(date) FROM draws GROUP BY game')),'lastSync':con.execute('SELECT at,status FROM sync_log ORDER BY id DESC LIMIT 1').fetchone(),'officialVerification':False}
        if resource=='payouts':data=[json.loads(x[0]) for x in con.execute('SELECT body FROM payouts')]
        else:
            rows=[json.loads(x[0]) for x in con.execute('SELECT body FROM draws WHERE updated>=? ORDER BY date',(since,))]
            if resource=='latest':
                games={}
                for row in rows:games[row['game']]=row
                data={'byGame':games}
            else:data=rows
    return {'api':'LottoLab gateway','version':'v1','resource':resource,'attribution':'Data by BetTip https://bettip.co.za/; ResultsZA when configured','data':data}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed=urllib.parse.urlparse(self.path);resource=parsed.path.rsplit('/',1)[-1].removesuffix('.json')
        if resource not in {'draws','payouts','latest','health'}:self.send_error(404);return
        query=urllib.parse.parse_qs(parsed.query);body=json.dumps(payload(resource,query.get('since',[''])[0]),separators=(',',':')).encode();etag='"'+hashlib.sha256(body).hexdigest()+'"'
        if self.headers.get('If-None-Match')==etag:self.send_response(304);self.end_headers();return
        self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.send_header('ETag',etag);self.send_header('Cache-Control','public, max-age=300');self.end_headers();self.wfile.write(body)
    def log_message(self,fmt,*args):pass

def scheduler():
    iteration=0
    while True:
        try:refresh(full=iteration%24==0)
        except Exception as error:print('Sync failed; cached results retained:',type(error).__name__,flush=True)
        iteration+=1;time.sleep(900)

if __name__=='__main__':
    connect().close()
    threading.Thread(target=scheduler,daemon=True).start()
    ThreadingHTTPServer((os.environ.get('HOST','127.0.0.1'),int(os.environ.get('PORT','8080'))),Handler).serve_forever()
