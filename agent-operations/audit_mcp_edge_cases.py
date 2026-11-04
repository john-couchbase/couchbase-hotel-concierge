import asyncio,json
from pathlib import Path
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client
async def main():
 out=[]
 with open('work/mcp-edge-stderr.log','w') as log:
  async with stdio_client(StdioServerParameters(command='/bin/sh',args=[str(Path('work/run-hotel-agent.sh').resolve())]),errlog=log) as (rd,wr):
   async with ClientSession(rd,wr) as s:
    await s.initialize()
    for name,args in [('unsupported price filter',{'country':'France','max_price':50}),('string boolean coercion',{'country':'France','free_parking':'false'}),('numeric boolean coercion',{'country':'France','free_parking':1}),('empty country',{'country':'   '}),('quoted country injection',{'country':'France" OR country:*'})]:
     r=await s.call_tool('filter_hotels',args)
     out.append({'case':name,'arguments':args,'is_error':r.isError,'response':r.model_dump(mode='json')})
 Path('outputs/agent-operations/mcp-edge-results.json').write_text(json.dumps(out,indent=2))
 print(json.dumps([{'case':x['case'],'is_error':x['is_error']} for x in out]))
asyncio.run(main())
