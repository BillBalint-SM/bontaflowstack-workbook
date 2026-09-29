import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.argv[2];
const server = http.createServer((req,res) => {
  const file = path.join(root, 'page.html');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(fs.readFileSync(file));
});
server.listen(0,'127.0.0.1',()=>process.send?.({port:server.address().port}));
process.on('message',message=>{if(message==='stop')server.close(()=>process.exit(0));});
