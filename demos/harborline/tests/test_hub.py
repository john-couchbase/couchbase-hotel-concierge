import unittest
from unittest.mock import Mock
from types import SimpleNamespace as NS
from hub import catalog,execute,fixture
from engine import call
class HubTests(unittest.TestCase):
 def test_projection_omits_secrets_raw_and_unknown_fields(self):
  meta=Mock();meta.model_dump.return_value={'name':'test','record_kind':'python_function','raw':'SECRET','secrets':['SECRET'],'embedding':[1], 'password':'SECRET','version':{'identifier':'revision','timestamp':'2026-11-12'}}
  c=Mock();c.bucket='demo';c.find.return_value=NS(meta=meta,content='public policy')
  result=catalog(NS(catalog=c))
  self.assertNotIn('SECRET',str(result));self.assertEqual(result['records'][0]['record']['version']['identifier'],'revision')
 def test_runner_rejects_unknown_function_before_loading_catalog(self):
  service=Mock()
  with self.assertRaises(ValueError):execute(service,fixture('empty'),'eval',{})
  service.catalog_context.assert_not_called()
 def test_fixture_upgrade_requires_checks_and_cannot_repeat(self):
  s=fixture('existing-stay')
  with self.assertRaises(ValueError):call(s,'apply_upgrade',{})
  call(s,'check_loyalty_tier',{});call(s,'find_reservations',{})
  self.assertEqual(call(s,'apply_upgrade',{})['extra_charge'],0)
  with self.assertRaises(ValueError):call(s,'apply_upgrade',{})
 def test_fixture_does_not_share_state(self):
  a=fixture('existing-stay');b=fixture('existing-stay');a['bookings'][0]['name']='changed';self.assertNotEqual(a,b)
