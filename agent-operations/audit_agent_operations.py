"""Live MCP retrieval regression. Fixtures are deliberate test cases, not autonomous model evaluations."""
import asyncio,json,time
from pathlib import Path
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client
OUT=Path('outputs/agent-operations')
async def main():
 results=[]
 with open('work/agent-operations-stderr.log','w') as log:
  async with stdio_client(StdioServerParameters(command='/bin/sh',args=[str(Path('work/run-hotel-agent.sh').resolve())]),errlog=log) as (rd,wr):
   async with ClientSession(rd,wr) as s:
    await s.initialize(); catalog=await s.list_tools()
    async def call(label,tool,args,expect):
     t=time.perf_counter();r=await s.call_tool(tool,args)
     texts=[x.text for x in r.content if x.type=='text']; data=None
     if not r.isError:
      try:data=json.loads(texts[0])
      except (ValueError,IndexError):pass
     ok=expect(r,data)
     results.append({'test':label,'tool':tool,'arguments':args,'passed':bool(ok),'is_error':r.isError,'client_ms':round((time.perf_counter()-t)*1000,2),'response':data if data is not None else texts})
     return data
    base=await call('exact all records','filter_hotels',{'limit':50},lambda r,d:not r.isError and d['total_hits']==50)
    for alias,country in [('france','France'),('UK','United Kingdom'),('usa','United States')]:
     await call('country alias '+alias,'filter_hotels',{'country':alias,'limit':50},lambda r,d,c=country:not r.isError and d['total_hits']>0 and all(x['fields']['country']==c for x in d['hits']))
    for value in [True,False]:
     await call('explicit parking '+str(value),'filter_hotels',{'free_parking':value,'limit':50},lambda r,d,v=value:not r.isError and d['total_hits']>0 and all(x['fields']['free_parking']==v for x in d['hits']))
    await call('combined exact restrictions','filter_hotels',{'country':'UK','pets_allowed':True,'free_parking':True,'limit':50},lambda r,d:not r.isError and all(x['fields']['country']=='United Kingdom' and x['fields']['pets_ok'] and x['fields']['free_parking'] for x in d['hits']))
    await call('unsupported geography','filter_hotels',{'country':'Mars'},lambda r,d:not r.isError and d['total_hits']==0)
    sem=await call('meaning plus strict restrictions','search_hotels_by_meaning',{'question':'quiet hotel with cooking facilities','country':'France','free_parking':True,'limit':5},lambda r,d:not r.isError and len(d['hits'])>0 and all(x['fields']['country']=='France' and x['fields']['free_parking'] for x in d['hits']))
    if sem and sem['hits']:
     h=sem['hits'][0]
     await call('hydrate semantic source','get_hotel',{'document_id':h['id']},lambda r,d:not r.isError and d.get('name')==h['fields']['name'] and 'embedding' not in d)
    for label,tool,args in [
      ('missing source','get_hotel',{'document_id':'hotel_999999999999'}),
      ('path traversal','get_hotel',{'document_id':'../../private'}),
      ('excessive result limit','filter_hotels',{'limit':1000}),
      ('blank meaning','search_hotels_by_meaning',{'question':' '}),
      ('unsupported booking tool','book_hotel',{}),
      ('invalid boolean','filter_hotels',{'free_parking':'sometimes'})]:
     await call(label,tool,args,lambda r,d:r.isError)
 out={'scope':'Custom local MCP over native Capella FTS and KV, not managed MCP; fixed regression fixtures, not a model-routing benchmark','tools':[t.model_dump(mode='json') for t in catalog.tools],'tests':results}
 OUT.joinpath('mcp-live-results.json').write_text(json.dumps(out,indent=2))
 print(json.dumps({'tests':len(results),'passed':sum(x['passed'] for x in results),'failed':[x['test'] for x in results if not x['passed']]}))
asyncio.run(main())
