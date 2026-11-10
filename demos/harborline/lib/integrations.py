"""Optional official Couchbase SDK adapters. No credentials or silent live fallback.
Configuration is private JSON supplied via HOTEL_SERVICES_CONFIG. Disabled by default.
"""
import json,hashlib,datetime,inspect
from contextvars import ContextVar
from pathlib import Path

class Services:
 @property
 def runtime_tools(self):return self._runtime_tools.get()
 @runtime_tools.setter
 def runtime_tools(self,value):self._runtime_tools.set(value)
 def __init__(self,config=None):
  self._runtime_tools=ContextVar("catalog_request_tools",default={})
  self.catalog=None;self.tracer=None;self.memory=None;self.collection=None;self.runtime_tools={};self.memory_budget=None
  self.status={k:'Not connected' for k in ('catalog','tracing','memory')}
  if not config:return
  cfg=json.loads(Path(config).read_text())
  if cfg.get('cluster'):
   from agentc_core.config import RemoteCatalogConfig
   c=dict(cfg['cluster']);c['password']=Path(c.pop('password_file')).read_text().strip()
   remote=RemoteCatalogConfig(**c,wait_until_ready_seconds=10)
   cluster=remote.Cluster()
   if cfg.get('session_collection'):
    scope,collection=cfg['session_collection'].split('.')
    self.collection=cluster.bucket(c['bucket']).scope(scope).collection(collection)
   if cfg.get('catalog'):
    from agentc import Catalog
    self.catalog=Catalog(**c,embedding_model_name="BAAI/bge-small-en-v1.5",embedding_model_url="http://127.0.0.1:8794/v1",embedding_model_auth="local-only")
    if self.catalog._remote_tool_catalog is None or self.catalog._remote_prompt_catalog is None:
     raise RuntimeError('Remote catalog not published; refusing local fallback')
    self.status['catalog']='Connected'
   if cfg.get('tracing'):
    from agentc_core.activity.logger import DBLogger
    from agentc_core.version import VersionDescriptor
    version=self.catalog.version if self.catalog else VersionDescriptor(timestamp=datetime.datetime.now(datetime.timezone.utc),identifier='harborline-live-v1',version_system='raw')
    self.tracer=DBLogger(remote,version,app='harborline-live-demo')
    self.status['tracing']='Connected; awaiting verified write'
  if cfg.get('memory'):
   from agentmemory import AgentMemoryClient
   m=cfg['memory'];self.memory=AgentMemoryClient(base_url=m['url'],token=Path(m['token_file']).read_text().strip(),timeout=15,max_retries=0)
   health=self.memory.health_ping()
   if health.overall_status.value!='healthy':raise RuntimeError('Agent Memory health check failed')
   self.status['memory']='Connected; awaiting verified write'
 def catalog_context(self,tools,policy,selected=None):
  if not self.catalog:return tools,policy
  self.runtime_tools={}
  prompt=self.catalog.find(kind='prompt',name='harborline_policy')
  if not prompt:raise ValueError('Harborline policy missing from remote catalog')
  schemas=[]
  for t in tools:
   n=t['function']['name'];found=self.catalog.find(kind='tool',name=n)
   if not found:raise ValueError('Remote tool missing: '+n)
   expected=t['function']['parameters'];actual=found.input
   if actual is None:
    params=inspect.signature(found.func).parameters
    actual={'type':'object','properties':{k:{'type':{str:'string',int:'integer'}.get(v.annotation,'unsupported')} for k,v in params.items()},'required':[k for k,v in params.items() if v.default is inspect.Parameter.empty]}
   self.runtime_tools[n]=found.func
   if set(actual.get('properties',{}))!=set(expected['properties']) or set(actual.get('required',[]))!=set(expected['required']) or any(actual['properties'][k].get('type')!=v['type'] for k,v in expected['properties'].items()):raise ValueError('Remote tool schema differs: '+n)
   schemas.append({'type':'function','function':{'name':n,'description':found.meta.description,'parameters':expected}})
  if not isinstance(prompt.content,str):raise ValueError('Expected a text policy')
  content=prompt.content
  if selected:
   parts=[]
   for p in selected:
    record=self.catalog.find(kind='prompt',name=p['name'])
    if not record or record.content!=p['content']:raise ValueError('Published policy differs from selected version: '+p['name'])
    parts.append(record.content)
   content+='\nSelected request policies:\n'+'\n'.join(parts)
  return schemas,content
 def execute(self,s,name,args):
  from engine import call
  if not self.catalog:return call(s,name,args)
  if name not in self.runtime_tools:raise ValueError('Tool not selected from catalog')
  # Keep the same argument and mutation policy checks inside the catalog callable.
  from hotel_tool_context import session
  token=session.set(s)
  try:return self.runtime_tools[name](**args)
  finally:session.reset(token)
 def trace(self,sid,event):
  if not self.tracer:return 'Not connected'
  from agentc.span import UserContent,AssistantContent,ToolCallContent,ToolResultContent,SystemContent
  kind=event.get('type')
  if kind=='selection':content=SystemContent(value=json.dumps(event,sort_keys=True))
  elif kind=='request':content=UserContent(value=event['text'])
  elif kind=='answer':content=AssistantContent(value=event['text'])
  elif kind=='tool' and event['state']=='Running':content=ToolCallContent(tool_name=event['name'],tool_args=event.get('arguments',{}),tool_call_id=event['call_id'])
  elif kind=='tool':content=ToolResultContent(tool_result=event.get('output',{}),tool_call_id=event['call_id'])
  else:return 'No trace event'
  before=self.tracer.dropped_log_count
  log=self.tracer.log(content,['harborline',event.get('run_id','request')],sid)
  if self.tracer.dropped_log_count!=before:raise RuntimeError('Trace write failed')
  saved=self.tracer.cb_coll.get(log.identifier).content_as[dict]
  if saved['span']['session']!=sid:raise RuntimeError('Trace readback failed')
  return 'Saved in Agent Tracer'
 def memory_session(self,sid):
  from agentmemory.exceptions import NotFoundError
  uid='harborline-'+hashlib.sha256(sid.encode()).hexdigest()[:24]
  try:user=self.memory.get_user(uid)
  except NotFoundError:user=self.memory.create_user(uid,'Demo guest')
  try:return user.get_session('hotel-demo')
  except NotFoundError:return user.create_session('hotel-demo',memory_blocks_ttl=86400)
 def recall(self,sid,message):
  if not self.memory:return []
  if self.memory_budget:self.memory_budget.consume()
  result=self.memory_session(sid).search_memory(query=message)
  return [b.fact or b.summary for b in result.memory_blocks[:5] if b.fact or b.summary]
 def remember_booking(self,sid,booking):
  if not self.memory:return 'Not connected'
  if self.memory_budget:self.memory_budget.consume()
  # Save confirmed structured facts only: no extra extraction call per chat turn.
  session=self.memory_session(sid)
  fact='Fictional demo booking record: '+json.dumps(booking,sort_keys=True)
  result=session.add_memory(facts=[fact],async_processing=False,memory_block_ttl=86400)
  if result.accepted_count!=1 or result.rejected_count:raise RuntimeError('Memory write rejected')
  read=session.list_memories(limit=20)
  blocks=read.memory_blocks
  if not any(b.block_id in result.block_ids and b.fact==fact for b in blocks):raise RuntimeError('Memory not yet verified by readback')
  return 'Saved in Agent Memory'
