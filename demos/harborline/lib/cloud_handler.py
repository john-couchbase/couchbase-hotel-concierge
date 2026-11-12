"""Vercel request handler. No local session cache or public secrets."""
import json,os,secrets,uuid,hmac,traceback
from copy import deepcopy
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from http.cookies import SimpleCookie
from urllib.parse import urlparse,parse_qs
from security import sign_session,valid_session,valid_host_origin
from distributed import Lease
from runtime import configured,get_runtime
from engine import new_session,run,confirm
from storage import public_state
from trace_evidence import record_event
LOGIN='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Harborline demo access</title><style>body{margin:0;background:#f5f3ef;color:#191919;font:16px system-ui;display:grid;min-height:100svh;place-items:center}main{width:min(340px,80vw);padding:32px;background:white;border:1px solid #ddd;border-radius:16px}h1{font-size:24px;margin:0 0 12px}input,button{box-sizing:border-box;width:100%;padding:14px;margin-top:12px;border:1px solid #bbb;border-radius:8px;font:inherit}button{background:#ea2328;color:white;border:0}p{line-height:1.5;color:#555}</style><main><h1>Harborline demo</h1><p>Enter your demo passphrase to try the live concierge.</p><form method="post" action="/api/login"><label for="password">Demo passphrase</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="200"><button>Open demo</button></form><p id="login-error" role="alert"></p></main><script>document.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const button=form.querySelector('button');button.disabled=true;try{const r=await fetch(form.action,{method:'POST',body:new URLSearchParams(new FormData(form)),credentials:'same-origin',mode:'cors'});if(r.ok){location.assign('/');return;}const text=await r.text();let message;try{message=JSON.parse(text).error;}catch{}document.getElementById('login-error').textContent=message||('Sign-in unavailable ('+r.status+'). Please try again.');}catch{document.getElementById('login-error').textContent='Connection unavailable. Please try again.';}button.disabled=false;});</script></html>'''
class handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def route(self):return parse_qs(urlparse(self.path).query).get('route',['page'])[0]
 def headers_reply(self,status=200,ctype='application/json',cookie=None):
  self.send_response(status);self.send_header('Content-Type',ctype);self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers()
 def error(self,status,text):self.headers_reply(status);self.wfile.write(json.dumps({'error':text}).encode())
 def auth(self):
  try:c=SimpleCookie(self.headers.get('Cookie',''));t=c['hotel_access'].value
  except (KeyError,ValueError):return None
  key=os.environ.get('HOTEL_SESSION_KEY','')
  return t.split('.')[0] if key and valid_session(key,t) else None
 def origin_ok(self):
  allowed={'https://couchbase-hotel-concierge.vercel.app','https://couchbase-hotel-concierge-jkupchankos-projects.vercel.app'}
  if os.environ.get('VERCEL_URL'):allowed.add('https://'+os.environ['VERCEL_URL'])
  return self.headers.get('Origin') in allowed or valid_host_origin(self.headers.get('Origin'),urlparse(self.headers.get('Origin','')).netloc)
 def do_GET(self):
  route=self.route()
  if route=='health':self.headers_reply();self.wfile.write(json.dumps({'runtime':'ready','configured':configured(),'backend_verified':False}).encode());return
  sid=self.auth();cookie=None
  if route=='page':
   key=os.environ.get('HOTEL_SESSION_KEY','')
   if len(key)<32:self.error(503,'Hosting setup is incomplete');return
   if not sid:
    sid=secrets.token_urlsafe(32);token=sign_session(key,sid)
    cookie=f'hotel_access={token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400'
   from page_template import PAGE
   live=parse_qs(urlparse(self.path).query).get('mode',['simulation'])[0]=='live'
   page=PAGE.replace('<body>','<body data-live="true">').replace('</body>','<script src="/live-preview.js"></script></body>') if live else PAGE
   self.headers_reply(200,'text/html; charset=utf-8',cookie);self.wfile.write(page.encode());return
  if not sid:self.error(401,'Open the demo first to start your session.');return
  if route!='state':self.error(404,'Not found');return
  try:
   services,store,_,_=get_runtime();s=store.load(sid) or new_session();s['services']=dict(services.status)
   self.headers_reply();self.wfile.write(json.dumps(public_state(s,store.label)).encode())
  except Exception:self.error(503,'Couchbase connection is not ready. No simulated response substituted.')
 def do_POST(self):
  if not self.origin_ok():self.error(403,'Origin not allowed');return
  route=self.route()
  try:
   n=int(self.headers.get('Content-Length','0'))
   if not 0<n<=8192:raise ValueError()
   raw=self.rfile.read(n)
  except ValueError:self.error(400,'Invalid request');return
  if route=='login':
   supplied=parse_qs(raw.decode()).get('password',[''])[0];expected=os.environ.get('HOTEL_DEMO_PASSWORD','')
   if not expected or not hmac.compare_digest(supplied.encode(),expected.encode()):self.error(401,'Incorrect demo passphrase, or hosting is not configured.');return
   key=os.environ.get('HOTEL_SESSION_KEY','')
   if len(key)<32:self.error(503,'Hosting setup is incomplete');return
   sid=secrets.token_urlsafe(32);token=sign_session(key,sid)
   self.send_response(303);self.send_header('Location','/');self.send_header('Cache-Control','no-store');self.send_header('Set-Cookie',f'hotel_access={token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400');self.end_headers();return
  sid=self.auth()
  if not sid:self.error(401,'Sign in to the demo first.');return
  if route not in ('chat','confirm','reset'):self.error(404,'Not found');return
  try:
   body=json.loads(raw)
   if not isinstance(body,dict):raise ValueError()
   if route=='chat' and (not isinstance(body.get('message'),str) or not 0<len(body['message'].strip())<=2000):raise ValueError()
  except (ValueError,TypeError):self.error(400,'Enter a message up to 2000 characters');return
  try:services,store,client,budget=get_runtime();lease=Lease(services.collection,sid);acquired=lease.acquire()
  except Exception:self.error(503,'Couchbase connection is not ready.');return
  if not acquired:self.error(409,'A request is already running.');return
  try:s=store.load(sid) or new_session()
  except Exception:lease.release();self.error(503,'Saved session could not be read.');return
  s['services']=dict(services.status);last_saved=deepcopy(s);runid=uuid.uuid4().hex
  self.headers_reply(200,'application/x-ndjson')
  def write(e):self.wfile.write((json.dumps(e)+'\n').encode());self.wfile.flush()
  def persist():
   nonlocal last_saved
   try:store.save(sid,s)
   except Exception:s.clear();s.update(deepcopy(last_saved));raise ValueError('Save failed. Review your bookings before retrying.')
   last_saved=deepcopy(s)
  def trace(e):
   s['services']['tracing']=record_event(services,sid,runid,e)
  def emit(e):
   if e['type']=='tool' and e['state']=='Returned':
    persist()
    if e.get('output',{}).get('reference') and services.memory:
     b=next((b for b in s['bookings'] if b['reference']==e['output']['reference']),None)
     if b:
      try:s['services']['memory']=services.remember_booking(sid,b)
      except Exception:s['services']['memory']='Memory save not verified'
   trace(e);write(e)
  try:
   if route=='reset':s.clear();s.update(new_session());s['services']=dict(services.status);persist();write({'type':'reset'})
   elif route=='confirm':
    selection=deepcopy(s.get('selection'))
    if selection:emit(selection)
    name,out=confirm(s,body.get('approval'));callid=uuid.uuid4().hex
    started={'type':'tool','name':name,'state':'Running','call_id':callid,'arguments':{'guest_approved':True}};emit(started)
    event={'type':'tool','name':name,'state':'Returned','call_id':callid,'output':out};emit(event)
    text='Demo cancellation saved: '+out['reference'] if out.get('cancelled') else 'Demo booking saved: '+out['reference']+' · '+out['name']+' · $'+format(out['total'],'.2f')+' total. No real booking or payment.'
    s['messages'].append({'role':'user','content':'Approved demo action result: '+json.dumps(out)})
    answer={'type':'answer','text':text,'pending':None};s['history'].append({'request':'Confirm demo action','events':([selection] if selection else [])+[started,event,answer]});emit(answer)
   else:trace({'type':'request','text':body['message']});run(s,client,body['message'],emit,services,sid,budget=budget)
   persist();write({'type':'state',**public_state(s,store.label)})
  except Exception as e:
   print('HOSTED_REQUEST_ERROR',type(e).__name__,[(f.filename.rsplit('/',1)[-1],f.lineno) for f in traceback.extract_tb(e.__traceback__)],flush=True)
   write({'type':'error','text':str(e) if isinstance(e,ValueError) else 'Backend request failed; no simulated answer substituted.'})
   write({'type':'state',**public_state(s,store.label)})
  finally:lease.release()
