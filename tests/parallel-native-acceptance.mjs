import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { snapshot } from './acceptance-fixtures.mjs';
import { context, digest } from '../plugins/bontaflowstack/core/state.mjs';
import { tasks } from '../plugins/bontaflowstack/core/tasks.mjs';
import { loadCatalog } from '../plugins/bontaflowstack/core/catalog.mjs';
import { workflow } from '../plugins/bontaflowstack/core/workflow.mjs';
import { delivery } from '../plugins/bontaflowstack/core/delivery.mjs';

const timeoutMs=180000;
function run(program,args,cwd,options={}) {
  const result=spawnSync(program,args,{cwd,encoding:'utf8',windowsHide:true,timeout:30000,...options});
  if(result.error||result.status!==0)throw new Error(`${program} ${args.join(' ')} failed: ${result.stderr||result.error?.message||result.status}`);
  return result.stdout.trim();
}
function put(root,file,content){const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
function initialize(repo){
  fs.mkdirSync(repo,{recursive:true});
  put(repo,'README.md','Native parallel acceptance fixture. Preserve this file.\n');
  put(repo,'src/a.txt','A foundation is complete.\n');
  put(repo,'src/b.txt','TODO\n');put(repo,'src/c.txt','TODO\n');
  put(repo,'tests/b.test.mjs',"import assert from 'node:assert/strict';import fs from 'node:fs';assert.equal(fs.readFileSync(new URL('../src/b.txt',import.meta.url),'utf8').trim(),'B');console.log('B behavior passed');\n");
  put(repo,'tests/c.test.mjs',"import assert from 'node:assert/strict';import fs from 'node:fs';assert.equal(fs.readFileSync(new URL('../src/c.txt',import.meta.url),'utf8').trim(),'C');console.log('C behavior passed');\n");
  put(repo,'tests/combined.test.mjs',"import assert from 'node:assert/strict';import fs from 'node:fs';assert.equal(fs.readFileSync(new URL('../src/b.txt',import.meta.url),'utf8').trim(),'B');assert.equal(fs.readFileSync(new URL('../src/c.txt',import.meta.url),'utf8').trim(),'C');console.log('B+C integrated check passed');\n");
  run('git',['init','--quiet'],repo);run('git',['add','.'],repo);
  run('git',['config','user.name','Acceptance'],repo);run('git',['config','user.email','acceptance@localhost'],repo);
  run('git',['-c','user.name=Acceptance','-c','user.email=acceptance@localhost','commit','--quiet','-m','accepted foundation A'],repo);
  const red={};
  for(const id of ['b','c']){
    const result=spawnSync(process.execPath,[`tests/${id}.test.mjs`],{cwd:repo,encoding:'utf8',windowsHide:true});
    if(result.status===0)throw new Error(`Expected the initial ${id.toUpperCase()} behavior check to fail before implementation`);
    red[id]={command:[process.execPath,`tests/${id}.test.mjs`],exit:result.status,stdout:result.stdout,stderr:result.stderr};
  }
  fs.writeFileSync(path.join(path.dirname(repo),'red-results.json'),JSON.stringify(red,null,2));
  return run('git',['rev-parse','HEAD'],repo);
}
export function create(root,plugin){
  if(!path.isAbsolute(root)||fs.existsSync(root))throw new Error('Choose a new absolute evidence root');
  if(!process.env.CODEX_THREAD_ID)throw new Error('Run fixture creation inside the real native coordinator task; CODEX_THREAD_ID is required and must not be fabricated.');
  fs.mkdirSync(root,{recursive:true});
  const repo=path.join(root,'repo'),base=initialize(repo),stateHome=path.join(root,'state');
  const env={...process.env,BFS_STATE_HOME:stateHome};
  const coordinator=context(repo,env);
  const plan={schema:1,planId:'native-parallel-pn',goal:'Complete B and C independently after foundation A, then unlock D',acceptanceSource:'User accepted P-N in tasks/plan.md; native parallel journey acceptance',tasks:[
    {id:'b',goal:'Implement B independently',dependsOn:[],writePaths:['src/b.txt'],inputs:['src/a.txt'],acceptance:['B output exists and test passes'],verification:['node tests/b.test.mjs']},
    {id:'c',goal:'Implement C independently',dependsOn:[],writePaths:['src/c.txt'],inputs:['src/a.txt'],acceptance:['C output exists and test passes'],verification:['node tests/c.test.mjs']},
    {id:'d',goal:'Verify B and C work together after integration',dependsOn:['b','c'],writePaths:['tests/combined.test.mjs'],inputs:['src/b.txt','src/c.txt'],acceptance:['The real combined integration test passes after B and C integrate'],verification:['node tests/b.test.mjs tests/c.test.mjs tests/combined.test.mjs']}
  ]};
  const stored=tasks(coordinator,'create',{plan},loadCatalog());
  const workers={};
  for(const id of ['b','c']){
    const folder=path.join(root,`worktree-${id}`);
    run('git',['worktree','add','--quiet','-b',`native-${id}`,folder,base],repo);
    workers[id]={folder,branch:`native-${id}`,base,writePaths:plan.tasks.find(row=>row.id===id).writePaths,
      inputs:plan.tasks.find(row=>row.id===id).inputs,acceptance:plan.tasks.find(row=>row.id===id).acceptance};
  }
  fs.cpSync(path.resolve(plugin),path.join(root,'plugin'),{recursive:true});
  const manifest={schema:1,createdAt:new Date().toISOString(),planId:plan.planId,acceptanceSource:plan.acceptanceSource,
    coordinator:{taskId:coordinator.taskId,workspace:repo,workspaceId:coordinator.workspaceId},stateHome,repo,baseRevision:base,
    plugin:path.join(root,'plugin'),pluginHashes:snapshot(path.join(root,'plugin')),workers,timeoutMs,
    sourceFiles:['README.md','src/a.txt']};
  fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
  for(const id of ['b','c']){
    const w=workers[id];
    const bindFile=path.join(root,`inputs/bind-${id}.json`),recordFile=path.join(root,`inputs/record-${id}.json`);
    fs.mkdirSync(path.dirname(bindFile),{recursive:true});
    fs.writeFileSync(bindFile,JSON.stringify({planId:plan.planId,taskId:id,workflowId:'<replace-with-the-real-workflow-id>'},null,2));
    fs.writeFileSync(recordFile,JSON.stringify({planId:plan.planId,taskId:id,summary:`${id.toUpperCase()} scoped implementation`,evidenceId:'<replace-with-the-real-delivery-evidence-id>'},null,2));
    const prompt=`Read only the frozen plugin at ${manifest.plugin} and the exact skills bfs-implement and bfs-landing-report it contains. You are native worker task ${id.toUpperCase()} for accepted task plan ${plan.planId}. Your worktree is ${w.folder}, branch ${w.branch}, expected base ${base}. The coordinator is ${repo}; shared isolated BFS_STATE_HOME is ${stateHome}. The other worker has a separate Git worktree and disjoint write scope.\n\nStart one BFS workflow for this task. Bind it with the real local CLI using a JSON input saved OUTSIDE the Git worktree at ${bindFile}; replace only workflowId with the actual workflow ID you started, then run node ${manifest.plugin}/core/cli.mjs tasks bind --input ${bindFile}. Implement only ${w.writePaths.join(' and ')}: change src/${id}.txt from the failing baseline TODO to exactly ${id.toUpperCase()}. Do not edit test files. First run node tests/${id}.test.mjs and record the failing RED result from the baseline; then run it again after the change and record the passing GREEN result. Commit only src/${id}.txt. Record completed prepare-stage delivery evidence owned by your workflow, subject target task:${id}, sourceRevision equal to your actual commit, provider local, input src/${id}.txt, and command node tests/${id}.test.mjs. Complete the workflow with the actual evidence ID. Use ${recordFile} for the tasks record JSON, replacing evidenceId with the actual delivery evidence ID, then run node ${manifest.plugin}/core/cli.mjs tasks record --input ${recordFile}. Confirm the recorded commit and plan status. Do not merge, push, remove worktrees, edit the other worker scope or touch files outside your declared scope. Preserve all other files.\n\nNo external publication, deployment, install, settings/trust edits or extra cleanup. If any precondition fails, stop and report the exact state. Answer in Hungarian and include actual commands, exits, RED/GREEN and resulting commit.`;
    fs.writeFileSync(path.join(root,`prompt-${id}.txt`),prompt);
  }
  fs.writeFileSync(path.join(root,'before.json'),JSON.stringify({repo:snapshot(repo),plugin:manifest.pluginHashes},null,2));
  return {root,manifest:path.join(root,'manifest.json'),baseRevision:base,planId:plan.planId,workerWorktrees:Object.fromEntries(Object.entries(workers).map(([id,w])=>[id,w.folder])),timeoutMs};
}
async function execute(entry,root,manifest,id){
  const w=manifest.workers[id],evidence=path.join(root,'evidence',id);fs.mkdirSync(evidence,{recursive:true});
  const env={...process.env,BFS_STATE_HOME:manifest.stateHome};delete env.CODEX_THREAD_ID;
  let gitConfigCount=Number.parseInt(env.GIT_CONFIG_COUNT||'0',10);
  if(!Number.isInteger(gitConfigCount)||gitConfigCount<0)throw new Error('Inherited GIT_CONFIG_COUNT must be a non-negative integer');
  const safeDirectories=[manifest.repo,w.folder];
  for(const directory of safeDirectories){env[`GIT_CONFIG_KEY_${gitConfigCount}`]='safe.directory';env[`GIT_CONFIG_VALUE_${gitConfigCount}`]=directory;gitConfigCount++;}
  env.GIT_CONFIG_COUNT=String(gitConfigCount);
  const args=[entry,'exec','--ignore-user-config','-c','windows.sandbox="elevated"','-c','model="gpt-6-sol"','-c','model_reasoning_effort="medium"','-c','approval_policy="never"','-s','workspace-write','--add-dir',root,'--skip-git-repo-check','-C',w.folder,'--json','-o',path.join(evidence,'final.txt'),'-'];
  const started=Date.now(),prompt=fs.readFileSync(path.join(root,`prompt-${id}.txt`),'utf8');
  const code=await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:w.folder,env,windowsHide:true});
    const out=fs.createWriteStream(path.join(evidence,'events.jsonl')),err=fs.createWriteStream(path.join(evidence,'stderr.txt'));
    child.stdout.pipe(out);child.stderr.pipe(err);child.stdin.end(prompt);
    const timer=setTimeout(()=>child.kill(),manifest.timeoutMs);
    child.once('error',error=>{clearTimeout(timer);out.end();err.end();reject(error);});
    child.once('close',status=>{clearTimeout(timer);Promise.all([new Promise(r=>out.end(r)),new Promise(r=>err.end(r))]).then(()=>resolve(status));});
  });
  const events=fs.readFileSync(path.join(evidence,'events.jsonl'),'utf8').split('\n').filter(Boolean).flatMap(line=>{try{return[JSON.parse(line)];}catch{return[];}});
  const record={id,exit:code,elapsedMs:Date.now()-started,thread:events.find(e=>e.type==='thread.started')?.thread_id,safeDirectories,
    commands:events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution').map(e=>({command:e.item.command,exit:e.item.exit_code,output:e.item.aggregated_output})),
    final:fs.existsSync(path.join(evidence,'final.txt'))?fs.readFileSync(path.join(evidence,'final.txt'),'utf8'):'',worktree:w.folder,
    diff:spawnSync('git',['diff','--stat',`${manifest.baseRevision}..HEAD`],{cwd:w.folder,encoding:'utf8',windowsHide:true}).stdout,
    head:spawnSync('git',['rev-parse','HEAD'],{cwd:w.folder,encoding:'utf8',windowsHide:true}).stdout.trim(),evidence};
  fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(record,null,2));
  return record;
}
export async function runWorkers(root,entry){
  if(!path.isAbsolute(root)||!path.isAbsolute(entry)||!fs.existsSync(entry))throw new Error('Provide the evidence root and verified absolute Codex JavaScript entry');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  if(digest(JSON.stringify(snapshot(manifest.plugin)))!==digest(JSON.stringify(manifest.pluginHashes)))throw new Error('Frozen plugin changed');
  const [b,c]=await Promise.all([execute(entry,root,manifest,'b'),execute(entry,root,manifest,'c')]);
  if(digest(JSON.stringify(snapshot(manifest.plugin)))!==digest(JSON.stringify(manifest.pluginHashes)))throw new Error('Worker changed the frozen plugin');
  const plan=tasks(context(manifest.repo,{...process.env,BFS_STATE_HOME:manifest.stateHome}),'status',{planId:manifest.planId},loadCatalog());
  for(const worker of [b,c]){
    if(worker.exit!==0||!worker.thread)throw new Error(`Worker ${worker.id} did not produce a completed real native task; inspect ${worker.evidence}`);
    const task=plan.tasks.find(row=>row.id===worker.id);
    if(task?.status!=='recorded')throw new Error(`Worker ${worker.id} is not recorded from current evidence (${task?.status||'missing'}); inspect ${worker.evidence}`);
  }
  const result={planId:manifest.planId,baseRevision:manifest.baseRevision,workers:[b,c],status:plan.tasks,sourceAfter:snapshot(manifest.repo),pluginHashes:manifest.pluginHashes};
  fs.writeFileSync(path.join(root,'worker-results.json'),JSON.stringify(result,null,2));
  return result;
}
export function coordinate(root){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  if(!process.env.CODEX_THREAD_ID||process.env.CODEX_THREAD_ID!==manifest.coordinator.taskId)throw new Error('Coordinator must use the same real native task identity that created the accepted plan.');
  const env={...process.env,BFS_STATE_HOME:manifest.stateHome},ctx=context(manifest.repo,env),catalog=loadCatalog();
  const status=()=>tasks(ctx,'status',{planId:manifest.planId},catalog);
  const initial=status();
  for(const id of ['b','c'])if(initial.tasks.find(row=>row.id===id)?.status!=='recorded')throw new Error(`Worker ${id} must have a current recorded result before coordination.`);
  if(initial.tasks.find(row=>row.id==='d')?.status!=='blocked')throw new Error('D should remain blocked until both worker integrations pass.');
  const checks=[];
  const verify= (id,inputs,commandFiles,integrateTask=true)=>{
    const merged=spawnSync('git',['merge','--no-ff','--quiet',`native-${id}`,'-m',`integrate ${id}`],{cwd:manifest.repo,encoding:'utf8',windowsHide:true});
    if(merged.error||merged.status!==0)throw new Error(`Git integration of ${id} failed; preserve both worktrees and inspect: ${merged.stderr||merged.error?.message}`);
    const head=run('git',['rev-parse','HEAD'],manifest.repo),record=workflow(ctx,'start',{goal:`Verify ${id} at the actual integration HEAD`,skills:['bfs-health']},catalog);
    workflow(ctx,'begin',{id:record.id,step:'1',inputs},catalog);
    const proof=delivery(ctx,'evidence',{workflowId:record.id,stage:'integrate',subject:{target:`task:${id}`,sourceRevision:head,provider:'local'},label:`${id} integration check`,files:inputs,
      command:commandFiles.length===1?[process.execPath,...commandFiles]:[process.execPath,'-e','for (const file of process.argv.slice(1)) require("node:child_process").execFileSync(process.execPath,[file],{stdio:"inherit"})',...commandFiles]});
    workflow(ctx,'step',{id:record.id,step:'1',status:proof.status==='completed'?'completed':'failed',summary:`${id} integration command exit ${proof.exitCode}`,evidence:[`delivery evidence ${proof.id}`]},catalog);
    if(proof.status!=='completed')throw new Error(`${id} integration verification failed: ${proof.stderr||proof.stdout}`);
    if(integrateTask)tasks(ctx,'integrate',{planId:manifest.planId,taskId:id,workflowId:record.id,evidenceId:proof.id},catalog);
    checks.push({target:`task:${id}`,workflowId:record.id,evidenceId:proof.id,head,command:proof.command,exit:proof.exitCode,status:proof.status,stdout:proof.stdout});
    return head;
  };
  const b=manifest.workers.b,c=manifest.workers.c;
  const bFiles=['src/b.txt','tests/b.test.mjs'];
  verify('b',bFiles,['tests/b.test.mjs']);
  if(status().tasks.find(row=>row.id==='d')?.status!=='blocked')throw new Error('D unlocked before C integration.');
  const cInputs=['src/b.txt','tests/b.test.mjs','src/c.txt','tests/c.test.mjs','tests/combined.test.mjs'];
  verify('c',cInputs,['tests/b.test.mjs','tests/c.test.mjs','tests/combined.test.mjs']);
  const ready=status();if(ready.tasks.find(row=>row.id==='d')?.status!=='ready')throw new Error('D is not ready after both actual worker commits were checked and integrated.');
  const dHead=run('git',['rev-parse','HEAD'],manifest.repo),dWorkflow=workflow(ctx,'start',{goal:'Run the combined D integration acceptance after B and C',skills:['bfs-health']},catalog);
  workflow(ctx,'begin',{id:dWorkflow.id,step:'1',inputs:cInputs},catalog);
  const dProof=delivery(ctx,'evidence',{workflowId:dWorkflow.id,stage:'integrate',subject:{target:'task:d',sourceRevision:dHead,provider:'local'},label:'D combined integration check',files:cInputs,
    command:[process.execPath,'tests/combined.test.mjs']});
  workflow(ctx,'step',{id:dWorkflow.id,step:'1',status:dProof.status==='completed'?'completed':'failed',summary:`D combined check exit ${dProof.exitCode}`,evidence:[`delivery evidence ${dProof.id}`]},catalog);
  if(dProof.status!=='completed')throw new Error(`D combined integration check failed: ${dProof.stderr||dProof.stdout}`);
  const result={coordinatorTaskId:ctx.taskId,planId:manifest.planId,initial:initial.tasks,checks,d:{readyStatus:ready.tasks.find(row=>row.id==='d').status,workflowId:dWorkflow.id,evidenceId:dProof.id,head:dHead,command:dProof.command,exit:dProof.exitCode,status:dProof.status,stdout:dProof.stdout},finalStatus:status().tasks,
    branches:Object.fromEntries(['b','c'].map(id=>[id,run('git',['rev-parse',`native-${id}`],manifest.repo)])),worktrees:Object.fromEntries(['b','c'].map(id=>[id,run('git',['status','--porcelain'],manifest.workers[id].folder)]))};
  fs.writeFileSync(path.join(root,'coordinator-results.json'),JSON.stringify(result,null,2));return result;
}
export function verifyD(root){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  if(!process.env.CODEX_THREAD_ID||process.env.CODEX_THREAD_ID!==manifest.coordinator.taskId)throw new Error('Coordinator must use the same real native task identity that created the accepted plan.');
  const ctx=context(manifest.repo,{...process.env,BFS_STATE_HOME:manifest.stateHome}),catalog=loadCatalog();
  const state=tasks(ctx,'status',{planId:manifest.planId},catalog),rows=new Map(state.tasks.map(row=>[row.id,row]));
  if(rows.get('b')?.status!=='integrated'||rows.get('c')?.status!=='integrated'||rows.get('d')?.status!=='ready')throw new Error('B and C must be integrated and D ready before D verification.');
  const files=['src/b.txt','tests/b.test.mjs','src/c.txt','tests/c.test.mjs','tests/combined.test.mjs'];
  const head=run('git',['rev-parse','HEAD'],manifest.repo),record=workflow(ctx,'start',{goal:'Reverify D using the actual combined acceptance test',skills:['bfs-health']},catalog);
  workflow(ctx,'begin',{id:record.id,step:'1',inputs:files},catalog);
  const proof=delivery(ctx,'evidence',{workflowId:record.id,stage:'integrate',subject:{target:'task:d',sourceRevision:head,provider:'local'},label:'D actual combined acceptance test',files,command:[process.execPath,'tests/combined.test.mjs']});
  workflow(ctx,'step',{id:record.id,step:'1',status:proof.status==='completed'?'completed':'failed',summary:`D combined test exit ${proof.exitCode}`,evidence:[`delivery evidence ${proof.id}`]},catalog);
  if(proof.status!=='completed')throw new Error(`D combined acceptance failed: ${proof.stderr||proof.stdout}`);
  const priorPath=path.join(root,'coordinator-results.json'),prior=fs.existsSync(priorPath)?JSON.parse(fs.readFileSync(priorPath,'utf8')):{};
  const result={readyStatus:'ready',workflowId:record.id,evidenceId:proof.id,head,command:proof.command,exit:proof.exitCode,status:proof.status,stdout:proof.stdout};
  fs.writeFileSync(priorPath,JSON.stringify({...prior,d:result,finalStatus:tasks(ctx,'status',{planId:manifest.planId},catalog).tasks},null,2));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [action,root,argument]=process.argv.slice(2);
  if(action==='create')console.log(JSON.stringify(create(root,argument),null,2));
  else if(action==='run')console.log(JSON.stringify(await runWorkers(root,argument),null,2));
  else if(action==='coordinate')console.log(JSON.stringify(coordinate(root),null,2));
  else if(action==='verify-d')console.log(JSON.stringify(verifyD(root),null,2));
  else throw new Error('Use create <new-root> <plugin>, run <root> <verified-codex-js-entry>, coordinate <root>, or verify-d <root>');
}
