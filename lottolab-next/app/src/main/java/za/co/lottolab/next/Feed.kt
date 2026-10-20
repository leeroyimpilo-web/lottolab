package za.co.lottolab.next

import android.content.Context
import androidx.room.withTransaction
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import za.co.lottolab.core.*
import java.time.*
import java.math.BigDecimal
import java.util.concurrent.TimeUnit

object FeedParser {
 data class Parsed(val draws:List<Draw>,val rejected:Int)
 fun parse(raw:String,payoutRaw:String?,now:Instant=Instant.now()):Parsed {
  val payload=JSONObject(raw).get("data")
  val rows=if(payload is JSONArray) payload else (payload as JSONObject).getJSONObject("byGame").let{o->JSONArray().also{a->o.keys().forEach{a.put(o.getJSONObject(it))}}}
  val payouts=mutableMapOf<String,List<Prize>>()
  if(payoutRaw!=null) {
   val list=JSONObject(payoutRaw).getJSONArray("data")
   for(i in 0 until list.length()) runCatching {
    val p=list.getJSONObject(i);val date=LocalDate.parse(p.getString("date"));val game=Games.canonical(p.getString("game"),date)
    val divisions=p.getJSONArray("divisions")
    val prizes=(0 until divisions.length()).mapNotNull{j->
     val v=divisions.getJSONObject(j);val label=v.getString("matched")
     val normalized=label.lowercase().replace("match", "").trim()
     val digits=Regex("\\d+").find(normalized)?.value?.toIntOrNull()
     val special=normalized.contains("bonus") || normalized.contains("powerball") || normalized.contains("pb")
     val m=digits?:if(special)0 else return@mapNotNull null
     val winners=if(v.isNull("winners"))null else v.getLong("winners")
     val cents=if(v.isNull("prize") || winners==0L) null else BigDecimal(v.get("prize").toString()).multiply(BigDecimal(100)).setScale(0,java.math.RoundingMode.HALF_UP).longValueExact().takeIf{it>=0}
     Prize(m,special,cents,winners,label)
    }
    payouts["$game:$date"]=prizes
   }
  }
  var rejected=0
  val out=mutableMapOf<String,Draw>()
  val conflicted=mutableSetOf<String>()
  for(i in 0 until rows.length()) {
   runCatching {
    val o=rows.getJSONObject(i);val date=LocalDate.parse(o.getString("date"))
    require(date<=now.atZone(ZoneId.of("Africa/Johannesburg")).toLocalDate())
    val game=Games.canonical(o.getString("game"),date)
    val ns=o.getJSONArray("numbers");val numbers=(0 until ns.length()).map{require(ns.get(it).toString().matches(Regex("[0-9]+")));ns.getInt(it)}.sorted()
    val special=if(o.isNull("bonusBall"))null else o.getInt("bonusBall")
    val rule=Rules.validate(game,date,numbers,special);val id="$game:$date"
    val d=Draw(id,game,date.toString(),numbers,special,rule.id,payouts[id]?:emptyList(),o.optString("provider","BetTip"),now.toString(),o.optString("sourceUrl"))
    if(id in conflicted) error("Conflicting duplicate")
    if(out[id]!=null && (out[id]?.numbers!=d.numbers || out[id]?.special!=d.special)){out.remove(id);conflicted+=id;error("Conflicting duplicate quarantined")}
    out[id]=d
   }.onFailure{rejected++}
  }
  return Parsed(out.values.toList(),rejected)
 }
}
object Sync {
 private val mutex=Mutex()
 private val client=OkHttpClient.Builder().connectTimeout(20,TimeUnit.SECONDS).readTimeout(60,TimeUnit.SECONDS).callTimeout(90,TimeUnit.SECONDS).build()
 private fun fetch(path:String):String=client.newCall(Request.Builder().url("${BuildConfig.FEED_BASE_URL}$path.json").header("User-Agent","LottoLabNext/1.0 (lottery research companion)").build()).execute().use{require(it.isSuccessful){"Data provider returned ${it.code}"};it.body!!.string()}
 suspend fun run(context:Context,full:Boolean=false):String=mutex.withLock{withContext(Dispatchers.IO){
  val db=Store.db(context);val dao=db.dao();val existing=dao.draws().associateBy{it.id}
  val prefs=context.getSharedPreferences("sync",0)
  val archiveDue=full || existing.isEmpty() || System.currentTimeMillis()-prefs.getLong("archiveAt",0)>TimeUnit.DAYS.toMillis(1)
  val raw=fetch(if(archiveDue)"draws" else "latest")
  val payoutResult=runCatching{fetch("payouts")}
  val parsed=FeedParser.parse(raw,payoutResult.getOrNull())
  require(parsed.draws.isNotEmpty()){"No usable results returned. Saved results retained."}
  var corrections=0;var fresh=0;var ticketMatches=0
  val tickets=dao.observeTickets().first().filter{it.purchased}
  db.withTransaction {
   parsed.draws.forEach{candidate->
    val old=existing[candidate.id]?.let{Store.draw(it)}
    val numberChange=old!=null && (old.numbers!=candidate.numbers || old.special!=candidate.special)
    // Never attach an old payout to corrected numbers if the payout feed failed.
    val d=if(old!=null && candidate.prizes.isEmpty() && !numberChange)candidate.copy(prizes=old.prizes) else candidate
    val changed=old!=null && (numberChange || old.prizes!=d.prizes)
    if(changed){corrections++;dao.revision(Revision(drawId=d.id,oldJson=Store.gson.toJson(old),changedAt=Instant.now().toString()));dao.alert(Alert("${d.id}:${old!!.revision+1}","Result updated", "${Games.all.find{it.id==d.game}?.title?:d.game} • ${d.date}. Recheck saved tickets."))}
    if(old==null && LocalDate.parse(d.date)>=LocalDate.now(ZoneId.of("Africa/Johannesburg")).minusDays(7)){fresh++;dao.alert(Alert(d.id,"New result", "${Games.all.find{it.id==d.game}?.title?:d.game} • ${d.date}"))}
    val revision=if(changed)old!!.revision+1 else old?.revision?:1
    if(old==null || changed)tickets.filter{it.game==d.game && it.date==d.date}.forEach{ticket->
     val assessment=runCatching{TicketReview.assess(ticket.game,LocalDate.parse(ticket.date),ticket.line(),d,LocalDate.now(ZoneId.of("Africa/Johannesburg")))}.getOrNull()
     if(assessment?.state==TicketState.PUBLISHED_PAYOUT || assessment?.state==TicketState.PAYOUT_UNCONFIRMED){
      ticketMatches++
      val label=if(assessment.state==TicketState.PUBLISHED_PAYOUT)"Possible prize on saved ticket" else "Ticket requires payout review"
      dao.alert(Alert("match:${ticket.id}:${d.id}:$revision",label,"${Games.get(d.game).title} • ${d.date}. ${assessment.description}. Confirm directly with the lottery operator."))
     }
    }
    dao.putDraws(listOf(Store.row(d.copy(revision=revision))))
   }
  }
  prefs.edit().putLong("lastSync",System.currentTimeMillis()).apply()
  if(archiveDue)prefs.edit().putLong("archiveAt",System.currentTimeMillis()).apply()
  if(existing.isNotEmpty() && fresh+corrections>0) Notifications.show(context,"LottoLab results updated","$fresh new results • $corrections updates • $ticketMatches saved ticket matches. Open to review.")
  "${parsed.draws.size} results checked • ${parsed.rejected} unsupported/invalid records skipped"+(if(payoutResult.isFailure)" • Payout feed unavailable" else "")
 }}
 suspend fun seed(context:Context)=withContext(Dispatchers.IO){
  val db=Store.db(context)
  if(db.dao().draws().isEmpty())runCatching {
   val raw=java.util.zip.GZIPInputStream(context.assets.open("draws.json.gz")).bufferedReader().readText()
   val payouts=java.util.zip.GZIPInputStream(context.assets.open("payouts.json.gz")).bufferedReader().readText()
   val parsed=FeedParser.parse(raw,payouts,Instant.parse("2026-10-19T21:33:00Z"))
   db.dao().putDraws(parsed.draws.map{Store.row(it)})
  }
 }
}
