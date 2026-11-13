import sys,unittest,threading,urllib.request,urllib.error,os
from pathlib import Path
from unittest.mock import patch
from http.server import HTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'hotel-backend'))
from cloud_handler import handler
class HttpTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=HTTPServer(('127.0.0.1',0),handler);cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start();cls.url='http://127.0.0.1:'+str(cls.server.server_port)+'/api/index?route='
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()
 def test_unauthenticated_state_never_opens_database(self):
  with patch('cloud_handler.get_runtime') as runtime:
   with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(self.url+'state')
   self.assertEqual(error.exception.code,401);runtime.assert_not_called()
 def test_public_page_creates_unique_private_sessions(self):
  from types import SimpleNamespace
  with patch.dict(os.environ,{'HOTEL_DEMO_PASSWORD':'secret-sentinel','HOTEL_SESSION_KEY':'k'*48}),patch.dict(sys.modules,{'page_template':SimpleNamespace(PAGE='<body>Concierge</body>')}):
   a=urllib.request.urlopen(self.url+'page');b=urllib.request.urlopen(self.url+'page')
   html=a.read().decode();self.assertIn('Concierge',html);self.assertNotIn('secret-sentinel',html)
   self.assertNotEqual(a.headers['Set-Cookie'],b.headers['Set-Cookie'])
   for flag in ['Secure','HttpOnly','SameSite=Strict']:self.assertIn(flag,a.headers['Set-Cookie'])
 def test_public_page_fails_closed_without_signing_key(self):
  with patch.dict(os.environ,{'HOTEL_SESSION_KEY':''}):
   with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(self.url+'page')
   self.assertEqual(error.exception.code,503)
 def test_cross_site_post_rejected(self):
  req=urllib.request.Request(self.url+'chat',data=b'{}',headers={'Origin':'https://evil.example'})
  with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(req)
  self.assertEqual(error.exception.code,403)
 def test_invalid_login_rejected(self):
  req=urllib.request.Request(self.url+'login',data=b'password=wrong',headers={'Origin':'https://couchbase-hotel-concierge.vercel.app'})
  with patch.dict(os.environ,{'HOTEL_DEMO_PASSWORD':'secret-sentinel'}):
   with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(req)
  self.assertEqual(error.exception.code,401)
 def test_valid_login_sets_secure_signed_cookie(self):
  class NoRedirect(urllib.request.HTTPRedirectHandler):
   def redirect_request(self,*args,**kwargs):return None
  req=urllib.request.Request(self.url+'login',data=b'password=correct-demo-passphrase',headers={'Origin':'https://couchbase-hotel-concierge.vercel.app'})
  with patch.dict(os.environ,{'HOTEL_DEMO_PASSWORD':'correct-demo-passphrase','HOTEL_SESSION_KEY':'k'*48}):
   with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.build_opener(NoRedirect).open(req)
  self.assertEqual(error.exception.code,303)
  cookie=error.exception.headers['Set-Cookie']
  for flag in ['Secure','HttpOnly','SameSite=Strict']:self.assertIn(flag,cookie)
  self.assertNotIn('correct-demo-passphrase',cookie)

 def test_mode_defaults_to_simulation_without_backend(self):
  from types import SimpleNamespace
  with patch.dict(os.environ,{'HOTEL_SESSION_KEY':'k'*48}),patch.dict(sys.modules,{'page_template':SimpleNamespace(PAGE='<body>Concierge</body>')}),patch('cloud_handler.get_runtime') as runtime:
   for suffix in ('page','page&mode=simulation'):
    html=urllib.request.urlopen(self.url+suffix).read().decode()
    self.assertNotIn('live-preview.js',html);self.assertNotIn('data-live',html)
   html=urllib.request.urlopen(self.url+'page&mode=live').read().decode()
   self.assertIn('live-preview.js',html);self.assertIn('data-live="true"',html)
   runtime.assert_not_called()
 def test_hub_reads_require_session(self):
  with patch('cloud_handler.get_runtime') as runtime:
   for endpoint in ('catalog','hub-history','trace-record&id=unknown'):
    with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(self.url+endpoint)
    self.assertEqual(error.exception.code,401)
   runtime.assert_not_called()
