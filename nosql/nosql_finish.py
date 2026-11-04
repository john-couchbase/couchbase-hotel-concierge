"""Native Couchbase exploratory lab. Writes only isolated nosql_lab scope."""
import json,time,statistics,concurrent.futures,traceback
from pathlib import Path
from datetime import timedelta,datetime,timezone
from couchbase.cluster import Cluster
from couchbase.auth import PasswordAuthenticator
from couchbase.options import ClusterOptions,QueryOptions,ReplaceOptions,UpsertOptions
from couchbase.n1ql import QueryScanConsistency
import couchbase.subdocument as SD
from couchbase.exceptions import CasMismatchException,DocumentExistsException,DocumentNotFoundException
OUT=Path('outputs/nosql');OUT.mkdir(exist_ok=True,parents=True)
cred=json.loads(Path('work/native-nosql-credential.json').read_text())
c=Cluster.connect('couchbases://YOUR_CLUSTER.cloud.couchbase.com',ClusterOptions(PasswordAuthenticator(cred['username'],cred['password'])))
c.wait_until_ready(timedelta(seconds=20));scope=c.bucket('vector-learning').scope(cred['scope'])
results=json.loads((OUT/'results.json').read_text());plans=json.loads((OUT/'plans.json').read_text());start=time.monotonic()
def save():
 (OUT/'results.json').write_text(json.dumps(results,indent=2,default=str));(OUT/'plans.json').write_text(json.dumps(plans,indent=2,default=str))
def log(name,**kw):
 row={'test':name,**kw};results.append(row);save();print(json.dumps(row,default=str),flush=True)
def keyspace(name):return '`vector-learning`.`'+cred['scope']+'`.`'+name+'`'
def query(sql,params=None,consistent=True):
 t=time.perf_counter();r=c.query(sql,QueryOptions(named_parameters=params or {},metrics=True,scan_consistency=QueryScanConsistency.REQUEST_PLUS if consistent else QueryScanConsistency.NOT_BOUNDED,timeout=timedelta(seconds=60)));rows=list(r.rows());return rows,(time.perf_counter()-t)*1000,r.metadata().metrics().execution_time().total_seconds()*1000

def doc(i):
 d={'type':'order','schema_version':1,'order_id':i,'customer_id':'customer::'+str(i%1000),'customer':{'name':'Customer '+str(i%1000),'tier':'gold' if i%10==0 else 'standard'},'status':['new','paid','shipped','cancelled'][i%4],'total_cents':1000+i%10000,'shipping':{'country':['US','UK','FR','DE','CA'][i%5],'city':'City '+str(i%100)},'items':[{'sku':'SKU'+str(i%50),'qty':1+i%3},{'sku':'SKU'+str((i+7)%50),'qty':1}]}
 if i%3==0:d['discount']=None
 elif i%3==1:d['discount']=10
 return d


customers=scope.collection('customers')
customers.mutate_in('customer::0',[SD.upsert('tier','platinum')]);ks=keyspace('orders_100')
r,ms,server=query('SELECT o.customer.tier AS embedded_tier,c.tier AS referenced_tier FROM '+ks+' o USE KEYS \"order::0\" JOIN '+keyspace('customers')+' c ON KEYS o.customer_id')
log('embedded_vs_reference',actual=r,passed=r==[{'embedded_tier':'gold','referenced_tier':'platinum'}],client_ms=ms,server_ms=server)
log('complete',utc=datetime.now(timezone.utc).isoformat())
c.close()
