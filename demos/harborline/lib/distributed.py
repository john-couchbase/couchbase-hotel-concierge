"""Cross-instance limits and session leases in the existing scoped collection."""
from datetime import datetime,timedelta
from zoneinfo import ZoneInfo
from couchbase.exceptions import DocumentNotFoundException,DocumentExistsException,CasMismatchException
from couchbase.options import InsertOptions,ReplaceOptions,RemoveOptions
import uuid
class Budget:
 def __init__(self,collection,service,limit):self.collection=collection;self.service=service;self.limit=limit
 def consume(self,day=None):
  day=day or datetime.now(ZoneInfo('America/Los_Angeles')).date().isoformat()
  key=f'harborline::budget::{day}::{self.service}'
  for _ in range(20):
   try:r=self.collection.get(key)
   except DocumentNotFoundException:
    try:self.collection.insert(key,{'count':1},InsertOptions(expiry=timedelta(days=2)));return 1
    except DocumentExistsException:continue
   used=r.content_as[dict]['count']
   if used>=self.limit:raise ValueError('Demo daily usage limit reached. Resets at midnight Pacific.')
   try:self.collection.replace(key,{'count':used+1},ReplaceOptions(cas=r.cas,expiry=timedelta(days=2)));return used+1
   except CasMismatchException:continue
  raise ValueError('Usage limiter is busy. Please try again.')
class Lease:
 def __init__(self,collection,sid):self.collection=collection;self.key='harborline::lease::'+sid;self.cas=None
 def acquire(self):
  try:r=self.collection.insert(self.key,{'owner':uuid.uuid4().hex},InsertOptions(expiry=timedelta(seconds=330)));self.cas=r.cas;return True
  except DocumentExistsException:return False
 def release(self):
  if self.cas is None:return
  try:self.collection.remove(self.key,RemoveOptions(cas=self.cas))
  except (DocumentNotFoundException,CasMismatchException):pass
