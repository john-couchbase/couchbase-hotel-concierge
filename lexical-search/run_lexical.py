import json,time,copy
from pathlib import Path
from lexical_http import call
OUT=Path('outputs/lexical');p=json.loads(Path('work/lexical-credential.json').read_text());scope=p['scope'];base='/api/bucket/vector-learning/scope/'+scope+'/index/'
docs=json.loads((OUT/'documents.json').read_text());results=[]
def save():(OUT/'results.json').write_text(json.dumps(results,indent=2))
def run(name,q=None,expected=None,index='lexical-lab',body=None):
 b={'query':q,'size':30,'fields':['standard_text','country','parking'],'explain':True} if body is None else body
 b['collections']=['texts']
 t=time.perf_counter();r=call(base+index+'/query','POST',b);elapsed=(time.perf_counter()-t)*1000
 data=r.get('body',{});hits=data.get('hits',[]) if isinstance(data,dict) else [];ids=[x['id'].split('.')[-1] for x in hits]
 status=data.get('status',{}) if isinstance(data,dict) else {};ok=r['status']==200 and isinstance(status,dict) and status.get('failed',0)==0 and not status.get('errors')
 row={'test':name,'index':index,'request':b,'http_status':r['status'],'partition_status':status,'total_hits':data.get('total_hits') if isinstance(data,dict) else None,'ids':ids,'hits':hits,'client_ms':elapsed,'server_took_ns':data.get('took') if isinstance(data,dict) else None,'request_succeeded':ok}
 if expected is not None:row.update(expected=sorted(expected),matches_expectation=ok and set(ids)==set(expected))
 if not ok:row['error']=data
 results.append(row);save();print(name,r['status'],ids,'expected',row.get('matches_expectation'),flush=True);return row
for idx in ['lexical-lab','lexical-bm25']:
 for _ in range(60):
  r=call(base+idx+'/query','POST',{'query':{'match_all':{}},'size':0,'collections':['texts']});b=r.get('body',{})
  if r['status']==200 and b.get('total_hits')==len(docs) and b.get('status',{}).get('failed',0)==0:break
  time.sleep(2)
 else:raise RuntimeError('Index not ready '+idx)
 print('Ready',idx,flush=True)
def match(s,f='standard_text',**kw):return {'match':s,'field':f,**kw}
run('standard_singular',match('kitchen'),['kitchen']);run('english_stemming',match('kitchen','english_text'),['kitchen','kitchens'])
run('standard_running',match('run'),['run']);run('english_running',match('run','english_text'),['run','running'])
run('stopword_standard',match('the'),[]);run('stopword_preserved',match('the','preserve_text'),[k for k,d in docs.items() if 'the' in d['standard_text'].lower().replace('.','').split()])
run('stopword_entity',match('The Who'),[]);run('entity_preserved',match('The Who','preserve_text',operator='and'),['band'])
run('uppercase_match',match('KITCHEN'),['kitchen']);run('uppercase_term',{'term':'KITCHEN','field':'standard_text'},[])
run('keyword_country_exact',{'term':'France','field':'country'},[k for k,d in docs.items() if d['country']=='France']);run('keyword_country_lowercase',{'term':'france','field':'country'},[])
run('phrase_adjacent',{'match_phrase':'free parking','field':'standard_text'},['free_parking'])
run('words_any_order',match('free parking',operator='and'),['free_parking','covered_parking'])
run('typo_no_fuzzy',match('kithen'),[]);run('typo_fuzzy_one',match('kithen',fuzziness=1),['kitchen'])
run('no_synonyms',match('car'),['car']);run('configured_synonyms',match('car','synonym_text'),['car','automobile']);run('reverse_synonym',match('automobile','synonym_text'),['car','automobile'])
run('buzzword_default',match('innovative'),['buzzwords']);run('buzzword_removed',match('innovative','buzz_text'),[])
run('buzzword_query_remaining_term',match('innovative platform','buzz_text',operator='and'),['buzzwords','plain_platform'])
run('accent_sensitive',match('cafe'),['ascii']);run('accent_folding',match('cafe','folded_text'),['ascii','accent'])
run('exact_identifier',{'term':'AB-123','field':'code'},['identifier']);run('identifier_partial',{'term':'AB','field':'code'},[])
run('negation_text',match('no parking',operator='and'),['no_parking','free_parking','covered_parking'])
run('structured_parking',{'conjuncts':[match('parking'),{'field':'parking','bool':True}]},['free_parking','covered_parking'])
run('unknown_field',match('kitchen','not_indexed'),[])
qv=json.loads((OUT/'query-vector.json').read_text())['vector'];fr={'term':'France','field':'country'};parking=match('parking')
knn={'field':'embedding','k':5,'vector':qv}
for idx in ['lexical-lab','lexical-bm25']:
 run('ranking_parking',parking,index=idx)
 run('vector_only',index=idx,body={'knn':[knn],'size':10,'fields':['standard_text','country','parking']})
 run('hybrid_country_is_not_filter',index=idx,body={'query':fr,'knn':[knn],'size':30,'fields':['standard_text','country','parking']})
 filtered={**knn,'filter':fr}
 run('vector_prefilter',index=idx,body={'knn':[filtered],'size':10,'fields':['standard_text','country','parking']})
 run('only_vector_branch_filtered',index=idx,body={'query':parking,'knn':[filtered],'size':30,'fields':['standard_text','country','parking']})
 run('both_branches_filtered',index=idx,body={'query':{'conjuncts':[parking,fr]},'knn':[filtered],'size':30,'fields':['standard_text','country','parking']})
# Live hotel baseline, preserve original production-like learning index.
oldbase='/api/bucket/vector-learning/scope/demo/index/hotel-semantic'
old=[]
for name,q in [('kitchen',{'match':'kitchen','field':'description'}),('kitchens',{'match':'kitchens','field':'description'}),('stopword_the',{'match':'the','field':'description'}),('lowercase_country',{'term':'france','field':'country'}),('exact_country',{'term':'France','field':'country'})]:
 r=call(oldbase+'/query','POST',{'query':q,'size':50,'fields':['name','description','country']},credential='work/hotel-agent-credential.json');old.append({'test':name,'response':r});print('hotel baseline',name,r['status'],r.get('body',{}).get('total_hits'),flush=True)
(OUT/'hotel-baseline.json').write_text(json.dumps(old,indent=2))
print('COMPLETE',len(results),flush=True)
