"""Session persistence for the loopback demo. Local SQLite is not Agent Memory."""
import json,sqlite3,threading,time
from pathlib import Path
from copy import deepcopy

class LocalStore:
 label='Saved on this Mac'
 def __init__(self,path):
  self.path=Path(path);self.path.parent.mkdir(parents=True,exist_ok=True);self.lock=threading.Lock()
  with self.connect() as db:db.execute('CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, body TEXT NOT NULL, updated REAL NOT NULL)')
  self.path.chmod(0o600)
 def connect(self):return sqlite3.connect(str(self.path),timeout=10)
 def load(self,sid):
  with self.connect() as db:row=db.execute('SELECT body FROM sessions WHERE id=? AND updated>?',(sid,time.time()-86400)).fetchone()
  return json.loads(row[0]) if row else None
 def save(self,sid,s):
  with self.lock,self.connect() as db:
   db.execute('DELETE FROM sessions WHERE updated<?',(time.time()-86400,))
   db.execute('INSERT OR REPLACE INTO sessions VALUES (?,?,?)',(sid,json.dumps(s),time.time()))

class CouchbaseStore:
 label='Saved in Couchbase'
 def __init__(self,collection,mirror=None):self.collection=collection;self.mirror=mirror
 def load(self,sid):
  from couchbase.exceptions import DocumentNotFoundException
  try:return self.collection.get('harborline::session::'+sid).content_as[dict]
  except DocumentNotFoundException:return None
 def save(self,sid,s):
  from datetime import timedelta
  from couchbase.options import UpsertOptions
  key='harborline::session::'+sid
  self.collection.upsert(key,s,UpsertOptions(expiry=timedelta(days=1)))
  if self.collection.get(key).content_as[dict]!=s:raise RuntimeError('Session readback failed')
  if self.mirror:self.mirror.save(sid,s)

def public_state(s,label):
 from model_usage import conversation_usage
 return {'usage':conversation_usage(s),'bookings':deepcopy(s['bookings']),'storage':label,'services':deepcopy(s.get('services',{})),
         'history':[{'request':r['request'],'events':[{k:v for k,v in e.items() if k!='pending'} for e in r['events']]} for r in s['history'][-20:]]}
