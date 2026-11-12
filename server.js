const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT) || 4173;
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js'};
http.createServer((req,res)=>{
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) {res.writeHead(404);res.end('Not found');return;}
  const type = file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html';
  fs.readFile(path.join(__dirname,file),(error,data)=>{if(error){res.writeHead(500);res.end('Unable to load game');return;}res.writeHead(200,{'Content-Type':`${type}; charset=utf-8`});res.end(data);});
}).listen(port,'127.0.0.1',()=>console.log(`Letter Garden is ready: http://localhost:${port}`));
