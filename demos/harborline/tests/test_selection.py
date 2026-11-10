import unittest,json
from unittest.mock import Mock
from types import SimpleNamespace as NS
from selection import choose,policies,revision
from integrations import Services
class SelectionTests(unittest.TestCase):
 def client(self,ids):
  c=Mock();c.chat.completions.create.return_value=NS(choices=[NS(message=NS(tool_calls=[NS(function=NS(name='select_policy',arguments=json.dumps({'policies':ids})))]))]);return c
 def test_upgrade_then_dinner_have_separate_tools(self):
  a=choose(self.client(['upgrade']),'Any chance of a nicer room?',[],lambda:None)
  b=choose(self.client(['dining']),'Now dinner for two',[],lambda:None)
  self.assertEqual(a[0]['tools'],['check_loyalty_tier','find_reservations','apply_upgrade'])
  self.assertTrue(set(a[0]['tools']).isdisjoint(b[0]['tools']))
 def test_unknown_policy_fails_closed(self):
  with self.assertRaises(ValueError):choose(self.client(['invented']),'test',[],lambda:None)
 def test_version_changes_with_rule(self):self.assertNotEqual(revision('rule'),revision('changed rule'))
 def test_remote_policy_must_match_version(self):
  svc=Services();svc.catalog=Mock();svc.catalog.find.side_effect=[NS(content='base'),NS(content='different')]
  with self.assertRaisesRegex(ValueError,'differs'):svc.catalog_context([],'base',[policies()[0]])
 def test_tool_selection_does_not_leak_previous_request(self):
  svc=Services();svc.catalog=Mock();svc.runtime_tools={'apply_upgrade':lambda:None};svc.catalog.find.return_value=NS(content='base')
  svc.catalog_context([],'base')
  with self.assertRaises(ValueError):svc.execute({},'apply_upgrade',{})

 def test_concurrent_selection_keeps_own_tools(self):
  from contextvars import copy_context
  svc=Services();svc.runtime_tools={'first':lambda:1}
  other=copy_context()
  other.run(setattr,svc,'runtime_tools',{'second':lambda:2})
  self.assertEqual(set(svc.runtime_tools),{'first'})
  self.assertEqual(other.run(lambda:set(svc.runtime_tools)),{'second'})
