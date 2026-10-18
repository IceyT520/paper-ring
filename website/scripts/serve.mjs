import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.pdf':'application/pdf','.json':'application/json; charset=utf-8'};
const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end('Bad request');return}
 const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
 if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end('Not found');return}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(target).pipe(res);
});
server.on('error',error=>{console.error(error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log(`纸环的两面 · http://127.0.0.1:${port}\n按 Ctrl+C 结束预览。`));
