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
 def test_stable_payload(self):
  server.ingest([self.row()],[]);self.assertEqual(len(server.payload('draws')['data']),1);self.assertEqual(server.payload('payouts')['data'],[])
if __name__=='__main__':unittest.main()
