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
results=[];plans={};start=time.monotonic()
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

def main():
 sb=scope.collection('sandbox')
 sb.upsert('cas',{'balance':100,'profile':{'city':'Paris'}})
 a=sb.get('cas');b=sb.get('cas');da=a.content_as[dict];db=b.content_as[dict];da['balance']+=10;db['balance']+=20;sb.replace('cas',da);sb.replace('cas',db)
 log('lost_update_without_cas',actual=sb.get('cas').content_as[dict]['balance'],correct_if_both_applied=130,expected_demonstration=120)
 sb.upsert('cas',{'balance':100,'profile':{'city':'Paris'}});a=sb.get('cas');b=sb.get('cas');da=a.content_as[dict];da['balance']=110;sb.replace('cas',da,ReplaceOptions(cas=a.cas))
 try:sb.replace('cas',{'balance':120},ReplaceOptions(cas=b.cas));log('cas_rejects_stale_write',passed=False)
 except CasMismatchException:log('cas_rejects_stale_write',passed=True)
 sb.mutate_in('cas',[SD.increment('balance',20),SD.upsert('profile.city','London')]);log('atomic_subdocument_update',passed=sb.get('cas').content_as[dict]=={'balance':130,'profile':{'city':'London'}})
 try:sb.mutate_in('cas',[SD.upsert('balance',999),SD.replace('missing.child',1)])
 except Exception as e:log('subdocument_rollback',error_type=type(e).__name__,passed=sb.get('cas').content_as[dict]['balance']==130)
 try:sb.insert('cas',{});log('duplicate_insert',passed=False)
 except DocumentExistsException:log('duplicate_insert',passed=True)
 sb.upsert('expires',{'temporary':True},UpsertOptions(expiry=timedelta(seconds=3)));time.sleep(4)
 try:sb.get('expires');log('ttl_expiry',passed=False)
 except DocumentNotFoundException:log('ttl_expiry',passed=True)
 customers=scope.collection('customers');customers.upsert_multi({'customer::'+str(i):{'name':'Customer '+str(i),'tier':'gold' if i%10==0 else 'standard'} for i in range(1000)})
 for name,n in [('orders_100',100),('orders_10k',10000),('orders_100k',100000),('orders_1m',1000000)]:
  if time.monotonic()-start>2100:log('growth_time_limit',skipped=name);break
  coll=scope.collection(name);ks=keyspace(name)
  def batch(lo):
   r=coll.upsert_multi({'order::'+str(i):doc(i) for i in range(lo,min(lo+250,n))})
   if not r.all_ok:raise RuntimeError('Batch mutation failed')
  t=time.perf_counter()
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(batch,range(0,n,250)))
  elapsed=time.perf_counter()-t;log('load',collection=name,documents=n,seconds=elapsed,documents_per_second=n/elapsed,json_bytes_sample=len(json.dumps(doc(0)).encode()))
  query('CREATE PRIMARY INDEX primary_orders ON '+ks+' WITH {"num_replica":0}')
  rows,ms,server=query('SELECT RAW COUNT(*) FROM '+ks);log('count_verification',collection=name,expected=n,actual=rows[0],passed=rows==[n])
  sql='SELECT o.order_id,o.total_cents FROM '+ks+' o USE INDEX (primary_orders USING GSI) WHERE o.status=$status AND o.shipping.country=$country ORDER BY o.order_id LIMIT 20'
  expected=[{'order_id':i,'total_cents':1000+i%10000} for i in range(n) if i%4==1 and i%5==2][:20]
  for phase in ['primary','covering']:
   if phase=='covering':
    query('CREATE INDEX status_country_cover ON '+ks+'(status,shipping.country,order_id,total_cents) WITH {"num_replica":0}')
    sql=sql.replace('primary_orders','status_country_cover')
   plans[name+'_'+phase]=query('EXPLAIN '+sql,{'status':'paid','country':'FR'})[0]
   samples=[];servers=[];ok=True
   for _ in range(5):
    rows,ms,server=query(sql,{'status':'paid','country':'FR'});samples.append(ms);servers.append(server);ok &=rows==expected
   log('filtered_query',collection=name,index=phase,passed=ok,rows=len(rows),client_median_ms=statistics.median(samples),server_median_ms=statistics.median(servers),client_samples_ms=samples)
  for kind in ['kv','sql_use_keys']:
   times=[]
   for i in range(20):
    k='order::'+str(i%n);t=time.perf_counter()
    if kind=='kv':v=coll.get(k).content_as[dict]
    else:v=query('SELECT RAW o FROM '+ks+' o USE KEYS $id',{'id':k})[0][0]
    assert v==doc(i%n);times.append((time.perf_counter()-t)*1000)
   log('point_read',collection=name,method=kind,passed=True,client_median_ms=statistics.median(times),client_samples_ms=times)
  for workers in [1,4,8]:
   def get(i):
    t=time.perf_counter();v=coll.get('order::'+str((i*7919)%n)).content_as[dict];assert v==doc((i*7919)%n);return (time.perf_counter()-t)*1000
   t=time.perf_counter()
   with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:lat=list(ex.map(get,range(160)))
   secs=time.perf_counter()-t;log('concurrent_reads',collection=name,workers=workers,operations=160,ops_per_second=160/secs,client_median_ms=statistics.median(lat),client_p95_ms=sorted(lat)[int(len(lat)*.95)-1],passed=True)
  rows,ms,server=query('SELECT COUNT(1) AS total, SUM(CASE WHEN discount IS MISSING THEN 1 ELSE 0 END) AS missing_count,SUM(CASE WHEN discount IS NULL THEN 1 ELSE 0 END) AS null_count FROM '+ks)
  log('missing_vs_null',collection=name,actual=rows[0],passed=rows[0]['null_count']==(n+2)//3 and rows[0]['missing_count']==n//3)
  injection=query('SELECT RAW COUNT(*) FROM '+ks+' WHERE status=$status',{'status':"paid' OR TRUE --"})[0];log('bound_parameter_injection',collection=name,passed=injection==[0],actual=injection)
  if n<=100000:
   query('CREATE INDEX item_sku ON '+ks+'(DISTINCT ARRAY i.sku FOR i IN items END) WITH {"num_replica":0}')
   s='SELECT RAW COUNT(*) FROM '+ks+' WHERE ANY i IN items SATISFIES i.sku=$sku END'
   plans[name+'_array']=query('EXPLAIN '+s,{'sku':'SKU7'})[0];r,ms,server=query(s,{'sku':'SKU7'});expected_count=sum(i%50 in [0,7] for i in range(n));log('array_query',collection=name,actual=r[0],expected=expected_count,passed=r==[expected_count],client_ms=ms,server_ms=server)
  # Consistency observation: does default-index consistency see immediate writes?
  misses=0;fresh=0
  for i in range(10):
   k='order::'+str(i);d=doc(i);d['status']='consistency_probe';coll.upsert(k,d)
   q='SELECT RAW COUNT(*) FROM '+ks+' USE INDEX (status_country_cover USING GSI) WHERE status=$status AND order_id=$i'
   r=query(q,{'status':'consistency_probe','i':i},False)[0];misses+=r!=[1]
   r=query(q,{'status':'consistency_probe','i':i},True)[0];fresh+=r==[1];coll.upsert(k,doc(i))
  log('read_after_write',collection=name,trials=10,default_stale_reads=misses,request_plus_current_reads=fresh,passed=fresh==10)
 # Embedded snapshot versus referenced customer: deliberate difference after customer update.
 customers.mutate_in('customer::0',[SD.upsert('tier','platinum')]);ks=keyspace('orders_100')
 r,ms,server=query('SELECT o.customer.tier AS embedded_tier,c.tier AS referenced_tier FROM '+ks+' o USE KEYS "order::0" JOIN '+keyspace('customers')+' c ON KEYS o.customer_id')
 log('embedded_vs_reference',actual=r,passed=r==[{'embedded_tier':'gold','referenced_tier':'platinum'}],client_ms=ms,server_ms=server)
 log('complete',elapsed_seconds=time.monotonic()-start,utc=datetime.now(timezone.utc).isoformat())
try:main()
except Exception as e:
 log('runner_failure',error_type=type(e).__name__,message=str(e));traceback.print_exc();raise
finally:c.close();save()
