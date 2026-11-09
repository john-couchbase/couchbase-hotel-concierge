"""Signed, short-lived demo access; no credentials sent to frontend JavaScript."""
import hashlib,hmac,time

def sign_session(key,sid,now=None):
 body=f'{sid}.{int(time.time() if now is None else now)}'
 return body+'.'+hmac.new(key.encode(),body.encode(),hashlib.sha256).hexdigest()
def valid_session(key,token,now=None):
 try:
  sid,stamp,signature=token.split('.')
  age=(time.time() if now is None else now)-int(stamp)
  return bool(sid) and 0<=age<86400 and hmac.compare_digest(sign_session(key,sid,int(stamp)),token)
 except (ValueError,TypeError,AttributeError):return False
def valid_origin(origin,expected):return bool(origin) and origin==expected

def valid_host_origin(origin,host):
 if not host:return False
 own=host in ('couchbase-hotel-concierge.vercel.app','couchbase-hotel-concierge-jkupchankos-projects.vercel.app') or (host.startswith('couchbase-hotel-concierge-') and host.endswith('-jkupchankos-projects.vercel.app'))
 return own and origin=='https://'+host
