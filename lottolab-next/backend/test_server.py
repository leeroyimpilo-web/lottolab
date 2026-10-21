import unittest,tempfile
from pathlib import Path
import server
class GatewayTest(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();server.ROOT=Path(self.tmp.name)
 def tearDown(self):self.tmp.cleanup()
 def row(self,n=None):return {'game':'lotto','date':'2026-06-03','numbers':n or [1,2,3,4,5,6],'bonusBall':7}
 def test_cutover(self):
  with self.assertRaises(ValueError):server.validate(self.row([1,2,3,4,5,58]))
  old=self.row([1,2,3,4,5,58]);old['date']='2026-05-30';self.assertEqual(server.validate(old)['ruleVersion'],'lotto-2025')
 def test_revisions(self):
  server.ingest([self.row()],[]);server.ingest([self.row([1,2,3,4,5,8])],[])
  with server.connect() as c:self.assertEqual(c.execute('SELECT COUNT(*) FROM revisions').fetchone()[0],1)
 def test_quarantine(self):
  self.assertEqual(server.ingest([self.row([1,1,2,3,4,5])],[]),(0,1));self.assertEqual(server.payload('health')['draws'],0)
 def test_conflicting_duplicates(self):
  self.assertEqual(server.ingest([self.row(),self.row([1,2,3,4,5,8])],[]),(0,2))
 def test_cross_source_agreement_has_no_false_revision(self):
  server.ingest([self.row()],[],source='BetTip')
  self.assertEqual(server.ingest([self.row()],[],source='ResultsZA'),(1,0))
  health=server.payload('health')
  self.assertEqual(health['thirdPartyAgreementDraws'],1)
  self.assertFalse(health['officialVerification'])
  with server.connect() as c:
   self.assertEqual(c.execute('SELECT COUNT(*) FROM revisions').fetchone()[0],0)
 def test_conflicting_provider_result_is_quarantined_and_not_overwritten(self):
  server.ingest([self.row()],[],source='BetTip')
  self.assertEqual(server.ingest([self.row([1,2,3,4,5,8])],[],source='ResultsZA'),(0,1))
  self.assertEqual(server.payload('health')['crossSourceMismatches'],1)
  with server.connect() as c:
   row=c.execute('SELECT body FROM draws WHERE id=?',('lotto:2026-06-03',)).fetchone()
   self.assertEqual(__import__('json').loads(row[0])['numbers'],[1,2,3,4,5,6])
   self.assertEqual(c.execute('SELECT COUNT(*) FROM revisions').fetchone()[0],0)
 def test_stable_payload(self):
  server.ingest([self.row()],[]);self.assertEqual(len(server.payload('draws')['data']),1);self.assertEqual(server.payload('payouts')['data'],[])
if __name__=='__main__':unittest.main()
