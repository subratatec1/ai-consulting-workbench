import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildPrompt,validateBrief} from './docs/core.js';
const root=fileURLToPath(new URL('./docs/',import.meta.url));
const port=Number(process.env.PORT||4173);
const modelURL='http://127.0.0.1:11434/api/chat';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
export function createServer(fetchModel=fetch){return http.createServer(async(req,res)=>{
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try{
    const host=req.headers.host||'';
    if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host))return json(403,{error:'Local host access only.'});
    if(req.headers.origin&&req.headers.origin!==`http://${host}`)return json(403,{error:'Cross-origin requests are blocked.'});
    const pathname=new URL(req.url,`http://${host}`).pathname;
    if(pathname==='/api/status'&&req.method==='GET')return json(200,{localAI:true,route:'local-ollama'});
    if(pathname==='/api/draft'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'JSON content type required.'});
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>150000)return json(413,{error:'Request too large.'});}
      let data;try{data=JSON.parse(body);}catch{return json(400,{error:'Invalid JSON.'});}
      let prompt;try{validateBrief(data.brief);prompt=buildPrompt(data.brief,data.workflow);}catch(e){return json(400,{error:e.message});}
      if(data.brief.classification==='restricted')return json(403,{error:'Restricted data cannot be sent to AI.'});
      if(data.brief.classification==='confidential'&&data.approvedSensitive!==true)return json(403,{error:'Explicit approval required for confidential data.'});
      if(typeof data.model!=='string'||!/^[A-Za-z0-9._:/-]{1,100}$/.test(data.model))return json(400,{error:'Invalid model name.'});
      const response=await fetchModel(modelURL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:data.model,stream:false,messages:[{role:'system',content:prompt.system},{role:'user',content:prompt.user}],options:{temperature:0.2}}),signal:AbortSignal.timeout(290000)});
      if(!response.ok)return json(502,{error:'Ollama rejected the request. Confirm the model is installed and the service is running.'});
      const result=await response.json();if(typeof result.message?.content!=='string'||!result.message.content.trim())return json(502,{error:'The model returned no draft.'});
      return json(200,{draft:result.message.content,mode:'local-ai',reviewRequired:true});
    }
    if(req.method!=='GET')return json(405,{error:'Method not allowed.'});
    const filename=pathname==='/'?'index.html':decodeURIComponent(pathname).replace(/^\//,'');
    if(!['index.html','app.js','core.js','style.css'].includes(filename))return json(404,{error:'Not found.'});
    const content=await readFile(path.join(root,filename));res.writeHead(200,{'Content-Type':types[path.extname(filename)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"});res.end(content);
  }catch(e){json(502,{error:e.name==='TimeoutError'?'The local model timed out. Try a smaller model or brief.':'Unable to reach the local AI service. Start Ollama and install the selected model.'});}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createServer().listen(port,'127.0.0.1',()=>console.log(`AI Consulting Workbench: http://localhost:${port}`));
