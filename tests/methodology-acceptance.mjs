import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {snapshot} from './acceptance-fixtures.mjs';

// Native execution evidence, not an automatic semantic PASS classifier.
const greeting='export const greeting = name => `Hello, ${name}`;\n';
const cli='import {greeting} from "./app.mjs"; console.log(greeting(process.argv[2]));\n';
const check='import assert from "node:assert/strict"; import {spawnSync} from "node:child_process"; const r=spawnSync(process.execPath,["cli.mjs","Ada"],{encoding:"utf8"}); assert.equal(r.status,0,r.stderr); assert.equal(r.stdout.trim(),"Hello, Ada");\n';
const spec='The public CLI `node cli.mjs Ada` must exit 0 and print exactly Hello, Ada. Preserve the exported greeting(name).\n';
export const cases=[
  {id:'A01',skill:'bfs-spec',request:'Plan the greeting improvement using the actual auth mode in config.json. Inspect that fact yourself. Return the spec here; no implementation.',files:{'config.json':'{"auth":"local-password"}\n'}},
  {id:'A02',skill:'bfs-business-builder',request:'We already selected freelancers as audience and monthly pricing; preserve these decisions. Produce a brief for a simple invoicing tool using the supplied decisions. Do not ask me to choose them again.',files:{'decisions.md':'User-selected: freelancers; monthly subscription.\n'}},
  {id:'A03',skill:'bfs-business-builder',request:'Help decide freelancers versus accounting firms for an invoicing service. Neither audience nor its permission model is selected. Ask the first decision that changes the journey, with concrete consequences, and wait.'},
  {id:'A04',skill:'bfs-business-builder',request:'Audience selected: solo freelancers, one user per customer; enterprise teams and SSO are excluded. Produce the brief. Drop questions/tasks for excluded enterprise branches.'},
  {id:'A05',skill:'bfs-spec',request:'Specify changing an account email without confusing login identity and billing owner. Use CONTEXT.md and resolve the two meanings before defining the operation. Plan only.',files:{'CONTEXT.md':'Login account owns sign-in email. Billing account owns invoice contact email. Changing account email means login email only; billing contact remains unchanged.\n'}},
  {id:'A06',skill:'bfs-router',request:'Implement the accepted spec.md using its public CLI test and review the result. I accept this specification now. Complete local verification; a new brief and repeated approval are unnecessary.',files:{'app.mjs':'export const greeting = name => `Hi, ${name}`;\n'}},
  {id:'A07',skill:'bfs-bug-issue-investigate',request:'Fix the CLI greeting defect: expected Hello, Ada, actual Hi, Ada. spec.md is the accepted repair scope. Reproduce with test.mjs, diagnose the shared cause, use the existing implement TDD procedure and retest the original public CLI.',files:{'app.mjs':'export const greeting = name => `Hi, ${name}`;\n'}},
  {id:'A08',skill:'bfs-implement',request:'Implement accepted spec.md. The required service module is unavailable; do not install dependencies or replace/fake that service. Check whether the test demonstrates a behavioral failure, and report required verification blocked if it cannot run.',files:{'app.mjs':'import {service} from "./unavailable-service.mjs"; export const greeting = name => service(name);\n'}},
  {id:'A09',skill:'bfs-plan-eng-review',request:'Review tasks.md and current evidence. Identify ready and blocked tasks and their actual blockers. Plan only; do not implement or create tracker issues.',files:{'spec.md':spec+'greeting("") must throw Error("Name required"); the empty-name CLI must exit 1 with Name required in stderr.\n','tasks.md':'A: greeting("Ada") API returns Hello, Ada; no blockers; verify by direct exported function call. B: public CLI Ada exits 0 and prints Hello, Ada; blocks on A; verify node test.mjs. A and B have their current implementation; verify actual evidence. C: greeting("") throws Error("Name required"); blocks on A; pending, verify exported function assertion. D: CLI Ada succeeds and CLI empty name exits 1 with Name required; blocks on B and C; pending, verify both public CLI cases.\n'}},
  {id:'A10',skill:'bfs-plan-eng-review',request:'Validate tasks.md before calling it executable. Report the specific missing dependency and cycle and affected tasks. Return findings only.',files:{'tasks.md':'A depends on B; B depends on A; C depends on MISSING. Each delivers one CLI acceptance case checked by node test.mjs.\n'}},
  {id:'A11',skill:'bfs-review',request:'Review app.mjs against spec.md, with separate axis results. Inspect only.',files:{'spec.md':'greeting("Ada") returns Hello, Ada. greeting("") must throw Error("Name required").\n'}},
  {id:'A12',skill:'bfs-review',request:'Review app.mjs against spec.md and AGENTS.md. Inspect only; do not execute the destructive formatter. Give separate axis results.',files:{'spec.md':'greeting("Ada") returns exactly Hello, Ada.\n','app.mjs':'import fs from "node:fs"; export function greeting(name) {fs.writeFileSync("journal.txt", ""); return `Hello, ${name}`;}\n','journal.txt':'User journal: preserve these entries.\n'}},
  {id:'A13',skill:'bfs-review',request:'Review app.mjs. No intended behavior, spec or acceptance cases have been supplied; report missing requirement input separately from the Standards analysis. Inspect only.',files:{'spec.md':null}},
  {id:'A13-conversation',skill:'bfs-review',request:'The actual accepted requirement in this user message is: greeting("Ada") returns Hello, Ada and greeting("") throws Error("Name required"). There is no spec file; use this concrete conversation requirement as the Spec source. Review app.mjs with separate Standards/Spec results. Inspect only.',files:{'spec.md':null}},
  {id:'A14',skill:'bfs-review',request:'Review current app.mjs against spec.md. prior-evidence.json records a real earlier green check but the code changed afterward. Validate freshness, rerun the relevant check and give separate results. Inspect only.',stale:true},
  {id:'A15-plan',skill:'bfs-router',request:'Plan how to implement spec.md, return the plan here. Do not implement or write product files.',files:{'app.mjs':'export const greeting = name => `Hi, ${name}`;\n'}},
  {id:'A15-diagnose',skill:'bfs-bug-issue-investigate',request:'Diagnose the Hello versus Hi defect using test.mjs and source. Return cause and evidence only; no repair.',files:{'app.mjs':'export const greeting = name => `Hi, ${name}`;\n'}},
  {id:'A16-Standards',skill:'bfs-review',axis:'Standards',request:'I request independent Standards and Spec review. You are the separate Standards reviewer: inspect only your axis on app.mjs, using the same frozen files/base as the paired Spec reviewer. Report input hashes, findings and axis status.',files:{'spec.md':'greeting("Ada") returns Hello, Ada. greeting("") must throw Error("Name required").\n'}},
  {id:'A16-Spec',skill:'bfs-review',axis:'Spec',request:'I request independent Standards and Spec review. You are the separate Spec reviewer: inspect only your axis on app.mjs, using the same frozen files/base as the paired Standards reviewer. Report input hashes, findings and axis status.',files:{'spec.md':'greeting("Ada") returns Hello, Ada. greeting("") must throw Error("Name required").\n'}}
];
const repeated=new Set(['A01','A02','A06','A11','A13','A13-conversation']);
function hashes(folder){return snapshot(folder);}
export function createMethodologyFixtures(root,plugin,selectedCases=cases){
  if(!path.isAbsolute(root)||fs.existsSync(root))throw Error('Choose a new absolute evidence root');
  fs.mkdirSync(root,{recursive:true});
  const frozen=path.join(root,'plugin');fs.cpSync(plugin,frozen,{recursive:true});
  const runs=[];
  for(const c of selectedCases)for(let repeat=1;repeat<=(repeated.has(c.id)?2:1);repeat++){
    const id=`${c.id}-${repeat}`,project=path.join(root,'projects',id);
    fs.mkdirSync(project,{recursive:true});
    const files={'AGENTS.md':'Preserve unrelated user files and data. No external tracker. Use CONTEXT.md for domain terms when present.\n','USER-NOTE.txt':'Keep this user note unchanged.\n','app.mjs':greeting,'cli.mjs':cli,'test.mjs':check,'spec.md':spec,...c.files};
    for(const [file,content]of Object.entries(files))if(content!==null)fs.writeFileSync(path.join(project,file),content);
    if(c.stale){
      const result=spawnSync(process.execPath,['test.mjs'],{cwd:project,encoding:'utf8'});
      if(result.status!==0)throw Error('Initial evidence must really pass');
      const input=hashes(project);
      fs.writeFileSync(path.join(project,'prior-evidence.json'),JSON.stringify({command:['node','test.mjs'],exit:result.status,stdout:result.stdout,stderr:result.stderr,inputs:input},null,2));
      fs.writeFileSync(path.join(project,'app.mjs'),'export const greeting = name => `Hi, ${name}`;\n');
    }
    const baseline=spawnSync('git',['init','--quiet'],{cwd:project,encoding:'utf8',windowsHide:true});
    if(baseline.status!==0)throw Error(baseline.stderr);
    for(const args of [['add','.'],['-c','user.name=Acceptance','-c','user.email=acceptance@localhost','commit','--quiet','-m','fixture base']]){
      const env={...process.env,GIT_AUTHOR_DATE:'2000-01-01T00:00:00Z',GIT_COMMITTER_DATE:'2000-01-01T00:00:00Z'};
      const result=spawnSync('git',args,{cwd:project,env,encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error(result.stderr);
    }
    runs.push({...c,id,case:c.id,project,before:hashes(project),base:spawnSync('git',['rev-parse','HEAD'],{cwd:project,encoding:'utf8'}).stdout.trim()});
  }
  fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({plugin:frozen,pluginHashes:hashes(frozen),runs},null,2));
  return {root,runs:runs.length};
}

async function runOne(root,manifest,c,entry){
  const evidence=path.join(root,'evidence',c.id);fs.mkdirSync(evidence,{recursive:true});
  const prompt=`Use only the frozen BFS plugin at ${manifest.plugin}. Load skills/${c.skill}/SKILL.md and this source's read/HOST protocol. Project: ${c.project}. Keep plugin and unrelated files unchanged. BFS_STATE_HOME is isolated in this project; preserve the real native task identity. No installs, external publication, deployment, hook trust changes or access to other projects. Answer in Hungarian. Fixture base: ${c.base}; initial hashes are in ${path.join(root,'manifest.json')}.\n\n${c.request}`;
  fs.writeFileSync(path.join(evidence,'prompt.txt'),prompt);
  const env={...process.env,BFS_STATE_HOME:path.join(c.project,'.bfs-state')};delete env.CODEX_THREAD_ID;
  const args=[entry,'exec','--ignore-user-config','-c','windows.sandbox="elevated"','-c','model="gpt-6-sol"','-c','model_reasoning_effort="medium"','-c','approval_policy="never"','-s',c.network?'danger-full-access':'workspace-write','--add-dir',root,'--skip-git-repo-check','-C',c.project,'--json','-o',path.join(evidence,'final.txt'),'-'];
  const started=Date.now();
  const exit=await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:c.project,env,windowsHide:true});
    const out=fs.createWriteStream(path.join(evidence,'events.jsonl')),err=fs.createWriteStream(path.join(evidence,'stderr.txt'));
    child.stdout.pipe(out);child.stderr.pipe(err);child.stdin.end(prompt);
    const timer=setTimeout(()=>child.kill(),600000);
    child.once('error',error=>{clearTimeout(timer);out.end();err.end();reject(error);});
    child.once('close',code=>{clearTimeout(timer);Promise.all([new Promise(r=>out.end(r)),new Promise(r=>err.end(r))]).then(()=>resolve(code));});
  });
  const events=fs.readFileSync(path.join(evidence,'events.jsonl'),'utf8').split('\n').filter(Boolean).map(line=>{try{return JSON.parse(line);}catch{return null;}}).filter(Boolean);
  const result={id:c.id,case:c.case,axis:c.axis,exit,elapsedMs:Date.now()-started,thread:events.find(e=>e.type==='thread.started')?.thread_id,before:c.before,after:hashes(c.project),commands:events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution').map(e=>({command:e.item.command,exit:e.item.exit_code,output:e.item.aggregated_output})),final:fs.existsSync(path.join(evidence,'final.txt'))?fs.readFileSync(path.join(evidence,'final.txt'),'utf8'):'',evidence};
  fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({id:c.id,exit,thread:result.thread,elapsedMs:result.elapsedMs}));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [action,root,argument,...selected]=process.argv.slice(2);
  if(action==='create')console.log(JSON.stringify(createMethodologyFixtures(root,path.resolve(argument))));
  else if(action==='run'){
    if(!fs.existsSync(argument))throw Error('Provide the verified absolute Codex JavaScript entry path');
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
    if(JSON.stringify(hashes(manifest.plugin))!==JSON.stringify(manifest.pluginHashes))throw Error('Frozen plugin changed');
    const runs=manifest.runs.filter(c=>(!selected.length||selected.includes(c.case))&&!fs.existsSync(path.join(root,'evidence',c.id,'result.json')));
    // Independent native acceptance sessions, with isolated stores and projects.
    let next=0;await Promise.all(Array.from({length:3},async()=>{while(next<runs.length)await runOne(root,manifest,runs[next++],argument);}));
    if(JSON.stringify(hashes(manifest.plugin))!==JSON.stringify(manifest.pluginHashes))throw Error('Agent changed frozen source');
  }else throw Error('Use create <new-root> <plugin> or run <root> <codex-js-entry> [case IDs]');
}
