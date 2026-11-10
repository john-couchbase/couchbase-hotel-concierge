"""Model-based semantic routing over versioned catalog policies, not vector search."""
import hashlib,json
from pathlib import Path
MODEL='amazon.nova-lite-v1:0'
REF={'X-cb-model-ref':'b4d8b5a5-361a-4a36-947e-8a71e4228198'}
def policies():return json.loads((Path(__file__).with_name('policies.json')).read_text())
def revision(content):return 'sha256:'+hashlib.sha256(content.encode()).hexdigest()[:12]
def choose(client,message,previous,consume):
 records=policies();choices=[{'id':p['id'],'description':p['description']} for p in records]
 schema={'type':'object','properties':{'policies':{'type':'array','items':{'type':'string','enum':[p['id'] for p in records]}}},'required':['policies'],'additionalProperties':False}
 consume()
 response=client.chat.completions.create(model=MODEL,extra_headers=REF,messages=[{'role':'system','content':'Select the smallest set of hotel policies matching the latest guest request by meaning. Choose multiple only for an explicit multi-intent request. Use recent conversation to resolve short replies; changing to dinner must not retain upgrade tools. Use general for greetings or requests outside supported actions, review for reviewing existing bookings. Return only the select_policy tool. Do not execute guest actions. Catalog: '+json.dumps(choices)},{'role':'user','content':json.dumps({'recent_messages':previous[-6:],'request':message})}],tools=[{'type':'function','function':{'name':'select_policy','description':'Choose supported policies for this request','parameters':schema}}],tool_choice={'type':'function','function':{'name':'select_policy'}},max_tokens=160)
 calls=response.choices[0].message.tool_calls
 if not calls or len(calls)!=1 or calls[0].function.name!='select_policy':raise ValueError('Policy selection unavailable. Please rephrase your request.')
 try: ids=json.loads(calls[0].function.arguments)['policies']
 except (ValueError,KeyError,TypeError):raise ValueError('Invalid policy selection')
 if not isinstance(ids,list) or not 1<=len(ids)<=3 or any(not isinstance(i,str) or i not in {p['id'] for p in records} for i in ids):raise ValueError('Unsupported policy selection')
 return [p for p in records if p['id'] in ids]
