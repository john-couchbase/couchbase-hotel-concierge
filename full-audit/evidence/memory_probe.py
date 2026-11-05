import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
from agentmemory.resources.session import SessionResource
from agentmemory import ChatMessage
http=Mock();http.post.return_value=SimpleNamespace(accepted_count=1,rejected_count=0)
s=SessionResource(http,'synthetic-user','synthetic-session');rows=[]
cases=[('prompt with context omitted',{'facts':['Prefers email'],'prompt_id':'support'}),('prompt with context true',{'facts':['Prefers email'],'prompt_id':'support','context_required':True}),('prompt with context false',{'facts':['Prefers email'],'prompt_id':'support','context_required':False}),('messages and facts together',{'facts':['Prefers email'],'messages':[ChatMessage(user_content='Hello')]}),('empty fact',{'facts':[' ']}),('prompt version without id',{'facts':['Prefers email'],'prompt_vid':1})]
for label,kw in cases:
 http.reset_mock()
 try:s.add_memory(**kw);error=None
 except Exception as e:error=type(e).__name__+': '+str(e)
 rows.append({'case':label,'error':error,'http_called':http.post.called,'payload':http.post.call_args.kwargs['json'] if http.post.called else None})
Path('outputs/full-audit/memory-validation-probes.json').write_text(json.dumps({'mode':'offline SDK validation with mocked HTTP; no extraction or service tested','version':'1.1.0','cases':rows},indent=2));print(json.dumps(rows,indent=2))
