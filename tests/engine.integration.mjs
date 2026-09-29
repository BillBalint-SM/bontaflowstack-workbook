import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import { context, digest } from '../plugins/bontaflowstack/core/state.mjs';
import { engines } from '../plugins/bontaflowstack/core/engines.mjs';

const engineRoot = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3] || '.tmp/engine-acceptance');
fs.mkdirSync(output,{recursive:true});
const ctx = context(output,{...process.env,BFS_STATE_HOME:path.join(output,'state'),CODEX_THREAD_ID:'bfs-engine-acceptance'});
const manifestHash=digest(fs.readFileSync(path.join(engineRoot,'engine.json')));
engines(ctx,'register',{root:engineRoot,sha256:manifestHash});
const evidence=[];
function call(capability,args) {
  const result=engines(ctx,capability,{args});
  assert.equal(result.exitCode,0,`${capability} ${args.join(' ')}: ${result.stderr || result.stdout || result.error}`);
  evidence.push({capability,args,exitCode:result.exitCode});
  return result.stdout;
}
const html=title=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font:18px system-ui;margin:24px;background:#f4f6fa;color:#17243c}main{max-width:800px;margin:auto}button{padding:12px;background:#173fa5;color:white;border:0;border-radius:6px}table{width:100%;margin:24px 0}td,th{text-align:left;padding:8px;border-bottom:1px solid #ccd3df}button:focus-visible{outline:3px solid #c04f00;outline-offset:3px}</style><main><h1>${title}</h1><p>A real browser acceptance page.</p><button id="action" onclick="document.querySelector('#result').textContent='Selected'">Choose offer</button><p id="result" aria-live="polite">Ready</p><table><thead><tr><th>Offer</th><th>Price</th></tr></thead><tbody><tr><td>Starter</td><td>19</td></tr><tr><td>Team</td><td>49</td></tr></tbody></table></main></html>`;
fs.writeFileSync(path.join(output,'page.html'),html('BontaFlowStack acceptance'));
const server=fork(fileURLToPath(new URL('./site.mjs',import.meta.url)),[output],{stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});
const port=await new Promise((resolve,reject)=>{server.once('message',m=>resolve(m.port));server.once('error',reject);server.once('exit',code=>reject(new Error(`Fixture server exited ${code}`)));});
try {
  call('browser',['goto',`http://127.0.0.1:${port}`]);
  assert.match(call('browser',['snapshot','-i']),/Choose offer/);
  call('browser',['click','#action']);
  assert.match(call('browser',['text']),/Selected/);
  call('browser',['js',"localStorage.setItem('bfs-continuation','present'); 'stored'"]);
  call('browser',['handoff','BontaFlowStack local acceptance check']);
  assert.match(call('browser',['resume']),/Choose offer|Selected|BontaFlowStack/);
  assert.match(call('browser',['js',"localStorage.getItem('bfs-continuation')"]),/present/);
  const extracted=JSON.parse(call('browser',['js',"JSON.stringify(Array.from(document.querySelectorAll('tbody tr'),row=>({offer:row.cells[0].textContent,price:Number(row.cells[1].textContent)})))"]));
  const rows=typeof extracted==='string'?JSON.parse(extracted):extracted;
  assert.deepEqual(rows,[{offer:'Starter',price:19},{offer:'Team',price:49}]);
  fs.writeFileSync(path.join(output,'scrape.json'),JSON.stringify({items:rows,count:rows.length,source:`http://127.0.0.1:${port}`},null,2));
  call('browser',['screenshot',path.join(output,'qa.png')]);
  const perf=call('browser',['perf']); assert.match(perf,/load|navigation|timing|paint/i);
  fs.writeFileSync(path.join(output,'performance.txt'),perf);
  for(let i=1;i<=3;i++) {
    const file=path.join(output,`variant-${i}.html`);
    fs.writeFileSync(file,html(`Design direction ${i}`));
    call('render',[file,'--screenshot',path.join(output,`variant-${i}.png`),'--width','1280','--height','800']);
  }
  const chosen=path.join(output,'variant-2.html');
  fs.copyFileSync(chosen,path.join(output,'selected.html'));
  call('render',[path.join(output,'selected.html'),'--screenshot',path.join(output,'selected-320.png'),'--width','320','--height','800']);
  call('design',['--help']);
  call('design',['compare','--images',`${path.join(output,'variant-1.png')},${path.join(output,'variant-2.png')}`,'--output',path.join(output,'comparison.html')]);
  assert.ok(fs.statSync(path.join(output,'comparison.html')).size>100);
  const pretext=engines(ctx,'pretext'); assert.ok(fs.statSync(pretext.resource).size>1000);
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({status:'completed',scope:'Real local browser, extraction, interaction, performance, render and comparison; no paid provider calls or native skill-selection claims',evidence},null,2));
  console.log(JSON.stringify({status:'completed',checks:evidence.length,artifacts:output}));
} finally {
  const stopped=engines(ctx,'browser',{args:['stop']});
  if(stopped.exitCode)console.error(stopped);
  server.send('stop');
  await new Promise(resolve=>server.once('exit',resolve));
}
