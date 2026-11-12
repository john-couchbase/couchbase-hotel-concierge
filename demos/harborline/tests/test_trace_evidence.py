import unittest
from unittest.mock import Mock
from trace_evidence import record_event
class TraceEvidenceTests(unittest.TestCase):
 def test_verified_record_and_run_are_attached(self):
  svc=Mock();svc.trace.return_value={'status':'Saved in Agent Tracer','record_id':'record-1','verified':True}
  e={'type':'tool','name':'search_rooms','state':'Returned','call_id':'call-1','output':{'rooms':[]}}
  record_event(svc,'private-session','run-1',e)
  self.assertEqual(e['run_id'],'run-1');self.assertTrue(e['trace']['verified']);self.assertEqual(e['trace']['record_id'],'record-1');self.assertNotIn('private-session',str(e));self.assertIn('timestamp',e)
 def test_failed_trace_does_not_claim_saved_or_expose_error(self):
  svc=Mock();svc.trace.side_effect=RuntimeError('secret-token')
  e={'type':'answer','text':'No availability'};record_event(svc,'session','run-2',e)
  self.assertFalse(e['trace']['verified']);self.assertNotIn('secret-token',str(e))
