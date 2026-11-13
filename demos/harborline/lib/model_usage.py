"""Provider token counts with a clearly separated AWS list-price estimate."""
from types import SimpleNamespace
import uuid,datetime
RATES={'input_per_million':0.06,'output_per_million':0.24,'currency':'USD','source':'https://aws.amazon.com/bedrock/pricing/','checked':'2026-11-13'}
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
   self.calls.append(record);self.session.setdefault('model_usage',[]).append(record)
   self.session['model_usage']=self.session['model_usage'][-500:]
   known=[c for c in self.calls if c['status']=='reported']
   inp=sum(c['input_tokens'] for c in known);out=sum(c['output_tokens'] for c in known)
   supported=all(c['model']=='amazon.nova-lite-v1:0' for c in self.calls)
   self.emit({'type':'usage','calls':len(self.calls),'reported_calls':len(known),'input_tokens':inp,'output_tokens':out,'complete':len(known)==len(self.calls),'estimated_usd':(inp*RATES['input_per_million']+out*RATES['output_per_million'])/1000000 if known and supported else None,'rates':RATES,'basis':'AWS reference estimate; excludes Capella, database, hosting and unreported calls'})
