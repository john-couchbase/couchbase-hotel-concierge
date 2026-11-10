"""Lazy, server-only configuration for the Vercel function."""
import os,json,tempfile,threading
from pathlib import Path
from openai import OpenAI
from integrations import Services
from storage import CouchbaseStore
from distributed import Budget
_lock=threading.Lock();_runtime=None

def configured():
 return all(os.environ.get(k) for k in ('HOTEL_CONFIG','HOTEL_MODEL_KEY','HOTEL_SESSION_KEY'))
def get_runtime():
 global _runtime
 with _lock:
  if _runtime:return _runtime
  if not configured():raise RuntimeError('Hosting setup is incomplete')
  raw=json.loads(os.environ['HOTEL_CONFIG']);cfg=dict(raw)
  folder=Path(tempfile.mkdtemp(prefix='harborline-'));folder.chmod(0o700)
  catalog_dir=folder/'catalog';catalog_dir.mkdir()
  os.environ['AGENT_CATALOG_CATALOG_PATH']=str(catalog_dir)
  def private(name,value):
   p=folder/name;p.write_text(value);p.chmod(0o600);return str(p)
  c=dict(raw['cluster']);c['password_file']=private('database',c.pop('password'))
  c['conn_root_certificate']=private('ca.pem',c.pop('certificate'))
  cfg['cluster']=c
  if raw.get('memory'):
   m=dict(raw['memory']);m['token_file']=private('memory',m.pop('token'));cfg['memory']=m
  service=Services(private('config.json',json.dumps(cfg)))
  if not service.collection or not service.catalog or not service.tracer:raise RuntimeError('Required backend service missing')
  service.memory_budget=Budget(service.collection,'memory',120)
  model=OpenAI(api_key=os.environ['HOTEL_MODEL_KEY'],base_url='https://1cqrm2ni1uwoym0s.ai.cloud.couchbase.com/v1',max_retries=0,timeout=30)
  _runtime=(service,CouchbaseStore(service.collection),model,Budget(service.collection,'model',40))
  return _runtime
