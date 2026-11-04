import json,subprocess,base64
from pathlib import Path
HOST='YOUR_SEARCH_NODE'
def call(path,method='GET',body=None,credential='work/lexical-credential.json'):
 p=json.loads(Path(credential).read_text());auth=base64.b64encode((p['username']+':'+p['password']).encode()).decode()
 args=['curl','-sS','--cacert','work/cluster-ca.pem','--connect-timeout','5','--max-time','20','--config','-','-X',method,'-w','\n%{http_code}','https://'+HOST+':18094'+path]
 if body is not None:args+=['--data-binary',json.dumps(body)]
 r=subprocess.run(args,input='header = "Authorization: Basic '+auth+'"\nheader = "Content-Type: application/json"\n',text=True,capture_output=True)
 if r.returncode:return {'status':0,'error':r.stderr.strip()}
 b,status=r.stdout.rsplit('\n',1)
 try:b=json.loads(b)
 except ValueError:pass
 return {'status':int(status),'body':b}
