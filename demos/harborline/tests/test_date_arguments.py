import unittest
from engine import call,new_session
class Dates(unittest.TestCase):
 def test_encoded_quotes(self):
  s=new_session();r=call(s,'validate_stay',{'start':'&#39;2099-12-10&#39;','end':'"2099-12-12"','guests':2});self.assertEqual(r['start'],'2099-12-10');self.assertEqual(r['nights'],2)
 def test_invalid_date_rejected(self):
  for date in ['2099-02-30','tomorrow','2099-12-10 extra']:
   with self.assertRaises(ValueError):call(new_session(),'validate_stay',{'start':date,'end':'2099-12-12','guests':2})
