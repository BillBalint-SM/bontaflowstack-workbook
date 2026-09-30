import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pluginRoot, loadCatalog } from '../plugins/bontaflowstack/core/catalog.mjs';
import { context, atomicWrite, digest, readJson } from '../plugins/bontaflowstack/core/state.mjs';
import { guard, preTool } from '../plugins/bontaflowstack/core/guard.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'bfs-measure-'));
const project=path.join(root,'project');fs.mkdirSync(project);fs.mkdirSync(path.join(project,'src'));
const env={...process.env,BFS_STATE_HOME:path.join(root,'state'),CODEX_THREAD_ID:'measurement-fixture',PLUGIN_ROOT:pluginRoot};
const ctx=context(project,env);
const event={hook_event_name:'PreToolUse',session_id:ctx.taskId,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git status --short'}};
const observation=preTool(ctx,event).hookSpecificOutput.additionalContext;
const command=readJson(path.join(pluginRoot,'hooks/hooks.json')).hooks.PreToolUse[0].hooks[0].commandWindows.match(/ -Command "(.+)"$/)[1];
const psArgs=['-NoProfile','-ExecutionPolicy','Bypass','-Command',command];
function hook() {
  const start=performance.now();
  const result=spawnSync('powershell.exe',psArgs,{cwd:project,env,input:JSON.stringify(event),encoding:'utf8',windowsHide:true,timeout:10000});
  if(result.status!==0) throw new Error(result.stderr||result.stdout||result.error?.message);
  return performance.now()-start;
}
const modes={};
for(const [name,policy] of [['off',{warnings:false,boundary:null}],['boundary',{warnings:false,boundary:'src'}],['warnings',{warnings:true,boundary:null}]]) {
  guard(ctx,'set',{observation,...policy});
  for(let i=0;i<3;i++) hook();
  const samples=Array.from({length:30},hook).sort((a,b)=>a-b);
  const medianMs=(samples[14]+samples[15])/2,p95Ms=samples[Math.ceil(samples.length*.95)-1];
  modes[name]={medianMs,p95Ms,samplesMs:samples,overBudget:medianMs>500||p95Ms>1000};
  console.error(`${name}: median ${medianMs.toFixed(1)} ms, p95 ${p95Ms.toFixed(1)} ms`);
}
guard(ctx,'set',{observation,warnings:false,boundary:null});
for(let pair=0;pair<10;pair++) {
  const file=path.join(ctx.workspaceDir,'tasks',`${ctx.taskId}.guard.json.observed.json`);
  if(pair%2) atomicWrite(file,{taskId:ctx.taskId,workspaceId:ctx.workspaceId,at:'2000-01-01T00:00:00Z'});
  else fs.unlinkSync(file);
  await Promise.all(Array.from({length:2},()=>new Promise((resolve,reject)=>{
    const child=spawn('powershell.exe',psArgs,{cwd:project,env,windowsHide:true,timeout:10000});
    let stdout='',stderr='';child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
    child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(stderr||stdout)));
    child.stdin.end(JSON.stringify(event));
  })));
}
const sequence=['bfs-implement','bfs-health','bfs-review'];
function reads(reuse) {
  let knownHostSha256;return sequence.map(skill=>{
    const result=spawnSync(process.execPath,[path.join(pluginRoot,'core/cli.mjs'),'read',skill,'--input','-'],{input:JSON.stringify(reuse&&knownHostSha256?{knownHostSha256}:{}),encoding:'utf8',windowsHide:true});
    if(result.status!==0)throw new Error(result.stderr);
    const value=JSON.parse(result.stdout);knownHostSha256=value.hostSha256;
    return {skill,bytes:Buffer.byteLength(result.stdout),fullHost:!!value.host};
  });
}
console.log(JSON.stringify({pluginRoot,version:loadCatalog().version,node:process.version,hostSha256:digest(fs.readFileSync(path.join(pluginRoot,'HOST.md'))),scope:'Local hook process fixtures; native trust/integration needs real chat evidence',modes,parallelPairs:10,context:{repeated:reads(false),reuse:reads(true)},artifacts:root},null,2));
