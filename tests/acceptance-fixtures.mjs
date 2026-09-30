import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, requireValue } from '../plugins/bontaflowstack/core/state.mjs';

export function snapshot(project) {
  const files = {};
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, {withFileTypes:true})) {
      if (['.git','.bfs-state','evidence','node_modules'].includes(entry.name)) continue;
      const file = path.join(folder,entry.name);
      requireValue(!entry.isSymbolicLink(),'Fixture contains a link');
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) files[path.relative(project,file).replaceAll('\\','/')] = digest(fs.readFileSync(file));
    }
  }
  visit(project);
  return files;
}

export function createFixtures(root) {
  requireValue(path.isAbsolute(root),'Use an absolute fixture directory');
  requireValue(!fs.existsSync(root),'Choose a new fixture directory');
  const put = (project,file,content) => {
    const target=path.join(root,project,file);
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);
  };
  for (const name of ['advice','review','sequence','missing','implement','plan','revision','qa-inspect','qa-fix','resume','publish','aliases','setup-empty','setup-existing','setup-no-tracker']) {
    put(name,'USER-NOTE.txt',`Preserve this user's text: ${name}.\n`);
    put(name,'app.mjs','export const greeting = name => `Hello, ${name}`;\n');
    put(name,'spec.md','Return Hello, Ada from greeting("Ada"). Keep the exported greeting function.\n');
  }
  put('review','app.mjs','export const greeting = name => name.toUpperCase();\n');
  for(const name of ['implement','sequence']) put(name,'app.mjs','export const greeting = name => `Hi, ${name}`;\n');
  put('revision','spec.md','approved: true\nChange the existing exported greeting(name) itself to accept finite numbers only and reject every string argument. Do not introduce another function.\n');
  for (const name of ['qa-inspect','qa-fix']) {
    put(name,'index.html','<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Counter</title><main><h1>Counter</h1><button id="increment">Increment</button><output id="count" aria-live="polite">0</output></main><script>document.querySelector("#increment").onclick=()=>document.querySelector("#count").textContent=Number(document.querySelector("#count").textContent)+2;</script></html>\n');
    put(name,'server.mjs','import http from "node:http";import fs from "node:fs";http.createServer((req,res)=>{res.setHeader("content-type","text/html");res.end(fs.readFileSync(new URL("index.html",import.meta.url)));}).listen(Number(process.env.PORT||0),"127.0.0.1",function(){console.log(this.address().port);});\n');
  }
  for(const name of ['setup-empty','setup-existing','setup-no-tracker']) put(name,'CONTEXT.md',`# ${name}\n\nDomain source: this file. Preserve this sentence exactly.\n`);
  put('setup-existing','AGENTS.md','# Existing instructions\n\nPreserve CUSTOM-RULE-123 exactly.\n\n- [Tracker](docs/agents/issue-tracker.md)\n- [Domain](docs/agents/domain.md)\n');
  put('setup-existing','docs/agents/issue-tracker.md','# Issue tracker\n\nNo external tracker. Preserve CUSTOM-TRACKER-123.\n');
  put('setup-existing','docs/agents/domain.md','# Domain\n\nRead ../../CONTEXT.md. Preserve CUSTOM-DOMAIN-123.\n');
  put('publish','artifact.txt','The selected local artifact.\n');
  put('publish','publisher.mjs',`import fs from 'node:fs';
const [action,target,id]=process.argv.slice(2),file=new URL('journal.json',import.meta.url);
const rows=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
if(action==='status'||action==='health'){console.log(JSON.stringify({rows,status:rows.length?'published':'absent'}));}
else if(action==='publish'&&target==='artifact.txt'&&id==='fixture-operation-1'){
 fs.appendFileSync(new URL('attempts.txt',import.meta.url),'publish\\n');
 if(!rows.some(row=>row.id===id)){rows.push({id,target,content:fs.readFileSync(new URL(target,import.meta.url),'utf8')});fs.writeFileSync(file,JSON.stringify(rows));}
 console.error('Simulated response loss after publication; inspect status before retry.');process.exitCode=7;
}else{console.error('Unknown local publisher operation');process.exitCode=1;}
`);
  put('publish','.bfstack/deploy.json',JSON.stringify({environments:{fixture:{deploy:[process.execPath,'publisher.mjs','publish','artifact.txt','fixture-operation-1'],status:[process.execPath,'publisher.mjs','status'],health:[process.execPath,'publisher.mjs','health']}}},null,2));
  fs.mkdirSync(path.join(root,'evidence'));
  fs.writeFileSync(path.join(root,'evidence','initial.json'),JSON.stringify(Object.fromEntries(fs.readdirSync(root).filter(name=>name!=='evidence').map(name=>[name,snapshot(path.join(root,name))])),null,2));
  return {root,projects:fs.readdirSync(root).filter(name=>name!=='evidence')};
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [action,folder]=process.argv.slice(2);
  requireValue(['create','snapshot'].includes(action),'Use create <new-absolute-root> or snapshot <project>');
  console.log(JSON.stringify(action==='create'?createFixtures(folder):snapshot(folder),null,2));
}
