"""Attach safe, verified trace evidence to the same events sent to the UI/history."""
from datetime import datetime, timezone

def record_event(services, session_id, run_id, event):
 event['run_id']=run_id
 event['timestamp']=datetime.now(timezone.utc).isoformat()
 try:
  result=services.trace(session_id,event)
  event['trace']=result if isinstance(result,dict) else {'status':result,'verified':False}
 except Exception:
  event['trace']={'status':'Trace save failed','verified':False}
 return event['trace']['status']
