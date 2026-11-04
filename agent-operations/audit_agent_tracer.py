"""Native integration of the unmodified Agent Catalog core DBLogger, NOT a full Catalog deployment."""
import json,time,datetime,importlib.metadata,logging
from pathlib import Path
from agentc_core.config import RemoteCatalogConfig
from agentc_core.version import VersionDescriptor
from agentc_core.activity.logger import DBLogger
from agentc.span import UserContent,ToolCallContent,ToolResultContent
from couchbase.exceptions import DocumentNotFoundException,CouchbaseException
OUT=Path('outputs/agent-operations');rows=[]
def record(name,passed,**detail):rows.append(dict(test=name,passed=bool(passed),**detail))
cred=json.loads(Path('work/agent-trace-credential.json').read_text())
kw=dict(conn_string='couchbases://YOUR_CLUSTER_ENDPOINT',username=cred['username'],password=cred['password'],bucket='vector-learning',conn_root_certificate=str(Path('work/cluster-ca.pem').resolve()),wait_until_ready_seconds=15)
config=RemoteCatalogConfig(**kw)
version=VersionDescriptor(timestamp=datetime.datetime.now(datetime.timezone.utc),identifier='audit-v1',version_system='raw')
logger=DBLogger(config,version,audit='learning-only')
col=logger.cb_coll
for content in [UserContent(value='Find hotels in France with parking'),ToolCallContent(tool_name='filter_hotels',tool_args={'country':'France','free_parking':True},tool_call_id='call-1'),ToolResultContent(tool_result={'fixture':'trace-format test only; live retrieval is in separate MCP results'},tool_call_id='call-1')]:
 t=time.perf_counter();item=logger.log(content,['audit','retrieval'],'session-A');data=col.get(item.identifier).content_as[dict]
 record('persist '+str(content.kind),data['content']==item.model_dump(mode='json',exclude_none=True)['content'],client_ms=round((time.perf_counter()-t)*1000,2))
record('version linked',data['catalog_version']['identifier']=='audit-v1')
record('span and session linked',data['span']=={'name':['audit','retrieval'],'session':'session-A'})
record('annotations preserved',data['annotations']['audit']=='learning-only')
itemB=logger.log(UserContent(value='Second session'),['audit'],'session-B');dataB=col.get(itemB.identifier).content_as[dict]
record('sessions distinct',dataB['span']['session']!=data['span']['session'])
# Synthetic marker, never a real secret: observe whether logger redacts content automatically.
marker='SYNTHETIC_SECRET_DO_NOT_USE'
private=logger.log(UserContent(value=marker),['audit'],'session-A')
record('raw marker retained',col.get(private.identifier).content_as[dict]['content']['value']==marker,classification='privacy caveat: logging does not automatically redact user content')
# Duplicate ID forces an actual DB write failure without altering access or networking.
with open('work/tracer-failure.log','w') as f:
 handler=logging.StreamHandler(f);logging.getLogger('agentc_core.activity.logger.db').addHandler(handler)
 before=logger.dropped_log_count
 returned=logger.log(UserContent(value='duplicate replacement attempt'),['audit'],'session-A',log_id=private.identifier)
 record('write failure counted without exception',logger.dropped_log_count==before+1,classification='availability trade-off: application continues; returned log object is not proof of persistence')
 record('duplicate does not overwrite',col.get(private.identifier).content_as[dict]['content']['value']==marker)
 logging.getLogger('agentc_core.activity.logger.db').removeHandler(handler)
exp=DBLogger(RemoteCatalogConfig(**kw,log_ttl=datetime.timedelta(seconds=3)),version)
short=exp.log(UserContent(value='expire me'),['audit'],'ttl-session')
record('TTL initially readable',exp.cb_coll.exists(short.identifier).exists)
time.sleep(4)
record('TTL expires',not exp.cb_coll.exists(short.identifier).exists)
# Actual scoped credential read outside audit collection; no write attempted.
try:config.Cluster().bucket('vector-learning').scope('demo').collection('hotels').get('hotel_10138');record('cross-scope access denied',False)
except CouchbaseException as e:record('cross-scope access denied',type(e).__name__ in ('AuthorizationException','AuthenticationException'),exception=type(e).__name__)
# Verify documentation import and supported current import without generating an LLM response.
try:exec('from agentc import tool');record('docs top-level decorator import',True)
except ImportError as e:record('docs top-level decorator import',False,exception=type(e).__name__,classification='documentation mismatch for agentc 1.1.5')
from agentc.catalog import tool
record('current decorator import',callable(tool))
result={'scope':'Unmodified agentc-core DBLogger native Capella persistence, using explicit raw version fixture; full Catalog CLI, semantic tool discovery, and model generation NOT tested','agentc_version':importlib.metadata.version('agentc'),'tests':rows}
OUT.joinpath('tracer-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'tests':len(rows),'passed':sum(x['passed'] for x in rows),'failed':[x['test'] for x in rows if not x['passed']]}))
