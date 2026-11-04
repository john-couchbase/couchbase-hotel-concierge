import json
from pathlib import Path
from lexical_http import call
O=Path('outputs/lexical');p=O/'followup.json';rows=json.loads(p.read_text());base='/api/bucket/vector-learning/scope/lexical_lab_20261103/index/lexical-lab'
for name,b in [('malformed_vector_with_validation',{'knn':[{'field':'embedding','k':5,'vector':[1,0,0]}],'ctl':{'validate':True},'size':5}),('prefix_query',{'query':{'prefix':'kitch','field':'standard_text'},'size':30}),('wildcard_query',{'query':{'wildcard':'kitch*','field':'standard_text'},'size':30}),('country_facets',{'query':{'match':'parking','field':'standard_text'},'facets':{'country':{'field':'country','size':10}},'size':30})]:
 b['collections']=['texts'];r=call(base+'/query','POST',b);rows.append({'test':name,'request':b,'response':r});print(name,r['status'],r.get('body',{}).get('total_hits'))
p.write_text(json.dumps(rows,indent=2))
# Decode actual analysis response into a field-to-token map, not a local emulation.
a=next(x for x in rows if x['test']=='analyze_document_type_field')['response']['body']['analyzed'];tokens={}
for group in a:
 for term,info in group.items():
  for loc in info.get('Locations',[]):tokens.setdefault(loc['Field'],set()).add(term)
(O/'tokens.json').write_text(json.dumps({k:sorted(v) for k,v in tokens.items()},indent=2))
for name in ['lexical-lab','lexical-bm25']:
 r=call(base.replace('lexical-lab',name)+'/status');(O/(name+'-status.json')).write_text(json.dumps(r,indent=2))
