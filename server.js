const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT) || 4173;
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js'};
http.createServer((req,res)=>{
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = files[pathname] || (/^\/audio\/[a-z]+(?:-[A-Z]|-on)?\.wav$/.test(pathname) ? pathname.slice(1) : null);
  if (!file) {res.writeHead(404);res.end('Not found');return;}
  const type = file.endsWith('.wav')?'audio/wav':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html';
  fs.readFile(path.join(__dirname,file),(error,data)=>{
    if(error){res.writeHead(404);res.end('Not found');return;}
    const headers={'Content-Type':`${type}${type==='audio/wav'?'':'; charset=utf-8'}`,'Accept-Ranges':'bytes'};
    const range=req.headers.range;
    if(range){
      const match=/^bytes=(\d+)-(\d*)$/.exec(range);
      const start=match?Number(match[1]):NaN;
      const end=match&&match[2]?Math.min(Number(match[2]),data.length-1):data.length-1;
      if(!Number.isInteger(start)||start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));return;
    }
    res.writeHead(200,{...headers,'Content-Length':data.length});res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Letter Garden is ready: http://localhost:${port}`));
