import unittest,sys,time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'lib'))
from security import sign_session,valid_session,valid_origin
class SecurityTests(unittest.TestCase):
 def test_session_tampering_and_expiry(self):
  key='k'*48;t=sign_session(key,'guest',100)
  self.assertTrue(valid_session(key,t,101))
  self.assertFalse(valid_session(key,t+'x',101))
  self.assertFalse(valid_session('wrong',t,101))
  self.assertFalse(valid_session(key,t,86501))
  self.assertFalse(valid_session(key,t,99))
 def test_origin_exact_match(self):
  self.assertTrue(valid_origin('https://demo.vercel.app','https://demo.vercel.app'))
  for origin in [None,'null','http://demo.vercel.app','https://demo.vercel.app.evil.test']:
   self.assertFalse(valid_origin(origin,'https://demo.vercel.app'))
if __name__=='__main__':unittest.main()

from distributed import Budget,Lease
from unittest.mock import Mock
from types import SimpleNamespace as NS
from couchbase.exceptions import DocumentNotFoundException,DocumentExistsException,CasMismatchException
class DistributedTests(unittest.TestCase):
 def test_budget_refuses_at_limit(self):
  coll=Mock();coll.get.return_value=NS(content_as={dict:{'count':40}},cas=9)
  with self.assertRaisesRegex(ValueError,'limit'):Budget(coll,'model',40).consume('2026-11-09')
  coll.replace.assert_not_called()
 def test_budget_retries_race_without_losing_count(self):
  coll=Mock();coll.get.side_effect=[NS(content_as={dict:{'count':3}},cas=1),NS(content_as={dict:{'count':4}},cas=2)]
  coll.replace.side_effect=[CasMismatchException(),NS()]
  self.assertEqual(Budget(coll,'model',40).consume('2026-11-09'),5)
 def test_second_instance_cannot_enter_same_session(self):
  coll=Mock();coll.insert.side_effect=DocumentExistsException()
  self.assertFalse(Lease(coll,'guest').acquire())
 def test_expired_lease_cannot_remove_new_owner(self):
  coll=Mock();coll.insert.return_value=NS(cas=42);coll.remove.side_effect=CasMismatchException()
  lease=Lease(coll,'guest');self.assertTrue(lease.acquire());lease.release()

class PreviewOriginTests(unittest.TestCase):
 def test_only_our_preview_hosts_are_accepted(self):
  from security import valid_host_origin
  host='couchbase-hotel-concierge-abc-jkupchankos-projects.vercel.app'
  self.assertTrue(valid_host_origin('https://'+host,host))
  self.assertFalse(valid_host_origin('https://evil.example',host))
  self.assertFalse(valid_host_origin('https://'+host+'.evil.example',host+'.evil.example'))
  self.assertFalse(valid_host_origin('https://other.vercel.app','other.vercel.app'))
