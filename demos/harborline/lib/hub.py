"""Public demo catalog projection and isolated, allowlisted function playground."""
import datetime as dt
from engine import DEFS,TOOLS,POLICY,new_session
from selection import policies
FIELDS={'record_kind','name','description','source','version','annotations','identifier','input','output','tools','content'}
def catalog(services):
 if not services.catalog:raise ValueError('Published catalog is not connected')
 rows=[]
 for kind,names in [('tool',list(DEFS)),('prompt',[p['name'] for p in policies()])]:
  for name in names:
   found=services.catalog.find(kind=kind,name=name)
   if not found:raise ValueError('Published record missing: '+name)
   data=found.meta.model_dump(mode='json')
   # Do not return raw files, embeddings, secrets or arbitrary extra fields.
   record={k:v for k,v in data.items() if k in FIELDS and k!='content'}
   if kind=='prompt':record['content']=found.content
   else:record['input']=next(t['function']['parameters'] for t in TOOLS if t['function']['name']==name)
   rows.append({'kind':kind,'record':record,'related_tools':next((p['tools'] for p in policies() if p['name']==name),[]),'location':{'bucket':services.catalog.bucket,'scope':'agent_catalog','collection':'tools' if kind=='tool' else 'prompts'},'omitted_fields':['raw','embedding','secrets','function source']})
 return {'source':'Live Agent Catalog','fetched_at':dt.datetime.now(dt.timezone.utc).isoformat(),'records':rows}
def fixture(kind):
 s=new_session()
 if kind=='existing-stay':
  start=dt.date.today()+dt.timedelta(days=2);end=start+dt.timedelta(days=2)
  s['bookings']=[{'reference':'HUB-SAMPLE-STAY','kind':'room','name':'Harbor King','room_id':'king','start':str(start),'end':str(end),'guests':2,'total':415.8,'upgrade_used':False}]
 return s
def execute(services,s,name,args):
 if name not in DEFS:raise ValueError('Unknown demo function')
 if not isinstance(args,dict):raise ValueError('Arguments must be a JSON object')
 tools=[t for t in TOOLS if t['function']['name']==name]
 services.catalog_context(tools,POLICY)
 return services.execute(s,name,args)
