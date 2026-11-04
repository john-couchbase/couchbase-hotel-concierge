import json,time,concurrent.futures
from pathlib import Path
from datetime import timedelta
from couchbase.cluster import Cluster
from couchbase.auth import PasswordAuthenticator
from couchbase.options import ClusterOptions,QueryOptions
import couchbase.subdocument as SD
p=json.loads(Path('work/native-nosql-credential.json').read_text());c=Cluster.connect('couchbases://YOUR_CLUSTER.cloud.couchbase.com',ClusterOptions(PasswordAuthenticator(p['username'],p['password'])));c.wait_until_ready(timedelta(seconds=15));sb=c.bucket('vector-learning').scope(p['scope']).collection('sandbox');rows=[]
try:
 docs={'schema1':{'amount':10},'schema2':{'amount':'10'},'schema3':{'amount':None},'schema4':{'new_field':True}}
 assert sb.upsert_multi(docs).all_ok
 q='SELECT META(d).id AS id,TYPE(d.amount) AS amount_type FROM `vector-learning`.`'+p['scope']+'`.`sandbox` d USE KEYS $ids ORDER BY META(d).id'
 actual=list(c.query(q,QueryOptions(named_parameters={'ids':list(docs)})).rows());rows.append({'test':'mixed_json_types','actual':actual,'passed':[x['amount_type'] for x in actual]==['number','string','null','missing']})
 sb.upsert('atomic_counter',{'count':0})
 def inc(i):sb.mutate_in('atomic_counter',[SD.increment('count',1)])
 t=time.perf_counter()
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(inc,range(100)))
 v=sb.get('atomic_counter').content_as[dict]['count'];rows.append({'test':'atomic_counter_concurrency','operations':100,'workers':8,'actual':v,'passed':v==100,'client_ms':(time.perf_counter()-t)*1000})
finally:
 c.close();Path('outputs/nosql/edgecases.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows))
