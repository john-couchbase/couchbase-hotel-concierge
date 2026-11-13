"""Provider token counts with a clearly separated AWS list-price estimate."""
from types import SimpleNamespace
import uuid,datetime
RATES={'input_per_million':0.06,'output_per_million':0.24,'currency':'USD','source':'https://aws.amazon.com/bedrock/pricing/','checked':'2026-11-13'}
def conversation_usage(session):
 if 'usage_totals' in session:return dict(session['usage_totals'])
 records=session.get('model_usage',[])
 known=[r for r in records if r['status']=='reported']
 missing_history=any(not any(e.get('type')=='usage' for e in h['events']) for h in session.get('history',[]))
 return {'calls':len(records),'reported_calls':len(known),'input_tokens':sum(r['input_tokens'] for r in known),'output_tokens':sum(r['output_tokens'] for r in known),'estimated_usd':sum((r['input_tokens']*.06+r['output_tokens']*.24)/1000000 for r in known if r['model']=='amazon.nova-lite-v1:0'),'complete':not missing_history and len(records)<500 and len(known)==len(records) and all(r['model']=='amazon.nova-lite-v1:0' for r in known)}

class Meter:
 def __init__(self,client,session,emit):
  self.client=client;self.session=session;self.emit=emit;self.calls=[]
  self.proxy=SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=self.create)))
 def create(self,**kwargs):
  record={'id':uuid.uuid4().hex,'model':kwargs.get('model'),'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'input_tokens':None,'output_tokens':None,'status':'unknown'}
  try:
   response=self.client.chat.completions.create(**kwargs)
   usage=getattr(response,'usage',None)
   for source,target in [('prompt_tokens','input_tokens'),('completion_tokens','output_tokens')]:
    value=usage.get(source) if isinstance(usage,dict) else getattr(usage,source,None)
    if type(value) is int and value>=0:record[target]=value
   record['status']='reported' if all(record[k] is not None for k in ['input_tokens','output_tokens']) else 'unavailable'
   return response
  finally:
   total=conversation_usage(self.session)
   total['calls']+=1
   if record['status']=='reported':
    total['reported_calls']+=1
    total['input_tokens']+=record['input_tokens'];total['output_tokens']+=record['output_tokens']
    if record['model']=='amazon.nova-lite-v1:0':total['estimated_usd']+=(record['input_tokens']*RATES['input_per_million']+record['output_tokens']*RATES['output_per_million'])/1000000
    else:total['complete']=False
   else:total['complete']=False
   self.session['usage_totals']=total
   self.calls.append(record);self.session.setdefault('model_usage',[]).append(record)
   self.session['model_usage']=self.session['model_usage'][-500:]
   known=[c for c in self.calls if c['status']=='reported']
   inp=sum(c['input_tokens'] for c in known);out=sum(c['output_tokens'] for c in known)
   supported=all(c['model']=='amazon.nova-lite-v1:0' for c in self.calls)
   self.emit({'type':'usage','calls':len(self.calls),'reported_calls':len(known),'input_tokens':inp,'output_tokens':out,'complete':len(known)==len(self.calls),'estimated_usd':(inp*RATES['input_per_million']+out*RATES['output_per_million'])/1000000 if known and supported else None,'rates':RATES,'basis':'AWS reference estimate; excludes Capella, database, hosting and unreported calls'})
