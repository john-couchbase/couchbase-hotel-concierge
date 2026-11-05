"""Offline contract probes. Spies replace database/HTTP; no live behavior claimed."""
import inspect,json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
from langchain_couchbase import CouchbaseQueryVectorStore,CouchbaseSearchVectorStore
from langchain_couchbase.vectorstores.query_vector_store import DistanceStrategy
from couchbase.search import MatchQuery
rows=[]
q=object.__new__(CouchbaseQueryVectorStore)
q._text_key='text';q._metadata_key='metadata';q._embedding_key='embedding';q._collection_name='docs';q._distance_metric=DistanceStrategy.COSINE
q._scope=Mock();q._scope.query.return_value.rows.return_value=[]
for label,kw in [('documented where_str',{'where_str':"metadata.country = 'France'"}),('Search-style filter passed to Query',{'filter':MatchQuery('France',field='metadata.country')}),('unknown kwarg',{'mandatory_country':'France'})]:
 q._scope.reset_mock();q.similarity_search_with_score_by_vector([0.1,0.2],k=2,**kw)
 sql=q._scope.query.call_args.args[0];rows.append({'case':label,'sql':sql,'contains_country_predicate':"WHERE metadata.country" in sql,'error':None})
s=object.__new__(CouchbaseSearchVectorStore);s._text_key='text';s._metadata_key='metadata';s._embedding_key='embedding';s._scoped_index=True;s._index_name='idx';s._scope=Mock();s._scope.search.return_value.rows.return_value=[]
try:s.similarity_search_with_score_by_vector([0.1,0.2],filter={'country':'France'});err=None
except Exception as e:err=type(e).__name__+': '+str(e)
rows.append({'case':'Search rejects plain-dict filter','error':err,'database_called':s._scope.search.called})
Path('outputs/full-audit/adapter-probes.json').write_text(json.dumps({'mode':'offline method execution with mocked database; constructor bypassed; no server query','package':'langchain-couchbase 1.2.0','cases':rows},indent=2));print(json.dumps(rows,indent=2))
