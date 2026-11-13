import unittest
from types import SimpleNamespace as NS
from unittest.mock import Mock
from model_usage import Meter
class UsageTests(unittest.TestCase):
 def meter(self,responses):
  client=Mock();client.chat.completions.create.side_effect=responses
  state={};events=[];return Meter(client,state,events.append),state,events
 def test_multiple_calls_and_persistence(self):
  m,s,e=self.meter([NS(usage=NS(prompt_tokens=100,completion_tokens=20)),NS(usage={'prompt_tokens':200,'completion_tokens':30})])
  for _ in range(2):m.create(model='amazon.nova-lite-v1:0')
  self.assertEqual(e[-1]['input_tokens'],300);self.assertEqual(e[-1]['output_tokens'],50)
  self.assertAlmostEqual(e[-1]['estimated_usd'],.00003)
  self.assertTrue(e[-1]['complete']);self.assertEqual(len(s['model_usage']),2)
 def test_missing_is_not_zero(self):
  m,s,e=self.meter([NS()]);m.create(model='amazon.nova-lite-v1:0')
  self.assertIsNone(e[-1]['estimated_usd']);self.assertFalse(e[-1]['complete'])
 def test_failed_call_recorded_without_inventing_usage(self):
  m,s,e=self.meter([RuntimeError('failure')])
  with self.assertRaises(RuntimeError):m.create(model='amazon.nova-lite-v1:0')
  self.assertEqual(len(s['model_usage']),1);self.assertIsNone(e[-1]['estimated_usd'])
 def test_unknown_model_has_no_assumed_price(self):
  m,s,e=self.meter([NS(usage={'prompt_tokens':10,'completion_tokens':10})]);m.create(model='other')
  self.assertIsNone(e[-1]['estimated_usd']);self.assertTrue(e[-1]['complete'])
 def test_partial_is_explicit(self):
  m,s,e=self.meter([NS(usage={'prompt_tokens':10,'completion_tokens':10}),NS()])
  for _ in range(2):m.create(model='amazon.nova-lite-v1:0')
  self.assertFalse(e[-1]['complete']);self.assertEqual(e[-1]['reported_calls'],1)
 def test_invalid_counts_not_accepted(self):
  m,s,e=self.meter([NS(usage={'prompt_tokens':-1,'completion_tokens':True})]);m.create(model='amazon.nova-lite-v1:0')
  self.assertIsNone(e[-1]['estimated_usd'])
 def test_conversation_totals_survive_ledger_limit(self):
  from model_usage import conversation_usage
  m,s,e=self.meter([NS(usage={'prompt_tokens':10,'completion_tokens':2})]*502)
  for _ in range(502):m.create(model='amazon.nova-lite-v1:0')
  total=conversation_usage(s)
  self.assertEqual(len(s['model_usage']),500)
  self.assertEqual(total['input_tokens'],5020)
  self.assertEqual(total['calls'],502)
  self.assertTrue(total['complete'])
 def test_legacy_history_is_marked_partial(self):
  from model_usage import conversation_usage
  self.assertFalse(conversation_usage({'history':[{'events':[]} ]})['complete'])
 def test_totals_accumulate_across_requests(self):
  from model_usage import conversation_usage
  m,s,e=self.meter([NS(usage={'prompt_tokens':10,'completion_tokens':2})]*2)
  m.create(model='amazon.nova-lite-v1:0')
  Meter(m.client,s,e.append).create(model='amazon.nova-lite-v1:0')
  self.assertEqual(conversation_usage(s)['input_tokens'],20)
