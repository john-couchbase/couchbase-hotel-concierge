import json,time
from pathlib import Path
from datetime import timedelta
from couchbase.cluster import Cluster
from couchbase.auth import PasswordAuthenticator
from couchbase.options import ClusterOptions,TransactionConfig
from couchbase.transactions import TransactionKeyspace
cred=json.loads(Path('work/native-nosql-credential.json').read_text());rows=[]
c=Cluster.connect('couchbases://YOUR_CLUSTER.cloud.couchbase.com',ClusterOptions(PasswordAuthenticator(cred['username'],cred['password']),transaction_config=TransactionConfig(metadata_collection=TransactionKeyspace(bucket='vector-learning',scope=cred['scope'],collection='sandbox'),timeout=timedelta(seconds=15))))
c.wait_until_ready(timedelta(seconds=15));coll=c.bucket('vector-learning').scope(cred['scope']).collection('sandbox')
try:
 for rollback in [False,True]:
  coll.upsert('accountA',{'balance':100});coll.upsert('accountB',{'balance':50})
  def tx(ctx):
   a=ctx.get(coll,'accountA');b=ctx.get(coll,'accountB');ctx.replace(a,{'balance':80});ctx.replace(b,{'balance':70})
   if rollback:raise RuntimeError('Intentional business rule rejection')
  t=time.perf_counter();error=None
  try:c.transactions.run(tx)
  except Exception as e:error=type(e).__name__
  actual=[coll.get(k).content_as[dict]['balance'] for k in ['accountA','accountB']]
  rows.append({'test':'transaction_rollback' if rollback else 'transaction_commit','actual':actual,'error':error,'passed':actual==([100,50] if rollback else [80,70]) and (error is not None if rollback else error is None),'client_ms':(time.perf_counter()-t)*1000})
finally:
 c.close();Path('outputs/nosql/transactions.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows))
