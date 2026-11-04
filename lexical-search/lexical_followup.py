import json,time
from pathlib import Path
from lexical_http import call
O=Path('outputs/lexical');base='/api/bucket/vector-learning/scope/lexical_lab_20261103/index/lexical-lab';rows=[];vec=json.loads((O/'query-vector.json').read_text())['vector']
def query(name,body):
 body['collections']=['texts'];r=call(base+'/query','POST',body);rows.append({'test':name,'request':body,'response':r});print(name,r['status'],r.get('body',{}).get('total_hits'),flush=True);return r
query('unknown_field_validation',{'query':{'match':'kitchen','field':'not_indexed'},'ctl':{'validate':True},'size':10})
query('phrase_highlighting',{'query':{'match_phrase':'free parking','field':'standard_text'},'highlight':{'style':'html','fields':['standard_text']},'fields':['standard_text'],'size':10})
f={'conjuncts':[{'term':'France','field':'country'},{'bool':True,'field':'parking'}]}
query('hybrid_both_branches_country_and_parking',{'query':{'conjuncts':[{'match':'parking','field':'standard_text'},f]},'knn':[{'field':'embedding','k':5,'vector':vec,'filter':f}],'size':30,'fields':['standard_text','country','parking']})
query('hybrid_impossible_country',{'query':{'conjuncts':[{'match':'parking','field':'standard_text'},{'term':'Mars','field':'country'}]},'knn':[{'field':'embedding','k':5,'vector':vec,'filter':{'term':'Mars','field':'country'}}],'size':30,'fields':['country']})
query('malformed_vector_dimensions',{'knn':[{'field':'embedding','k':5,'vector':[1,0,0]}],'size':5})
# Capture the unrestricted count to document why readiness was scoped to texts.
for name,b in [('match_all_unrestricted',{'query':{'match_all':{}},'size':30,'fields':['standard_text']}),('match_all_text_collection',{'query':{'match_all':{}},'size':30,'collections':['texts'],'fields':['standard_text']})]:rows.append({'test':name,'request':b,'response':call(base+'/query','POST',b)})
b={'type':'lexical_lab_20261103.texts',**{f:'The kitchens are innovative and seamless. No parking.' for f in ['standard_text','english_text','preserve_text','buzz_text','synonym_text','folded_text']}}
r=call('/api/index/vector-learning.lexical_lab_20261103.lexical-lab/analyzeDoc','POST',b);rows.append({'test':'analyze_document_type_field','request':b,'response':r});print('Analyze',r['status'],flush=True)
(O/'followup.json').write_text(json.dumps(rows,indent=2))
