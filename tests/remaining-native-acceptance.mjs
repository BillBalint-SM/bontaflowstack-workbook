import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createMethodologyFixtures} from './methodology-acceptance.mjs';
import {snapshot} from './acceptance-fixtures.mjs';
import {context} from '../plugins/bontaflowstack/core/state.mjs';
import {workflow} from '../plugins/bontaflowstack/core/workflow.mjs';
import {memory} from '../plugins/bontaflowstack/core/memory.mjs';
import {loadCatalog} from '../plugins/bontaflowstack/core/catalog.mjs';

const cases=[
  {id:'C01-1',skill:'bfs-save-context',request:'Read seed.json and pause its selected workflow once, preserving both accepted memory revisions. Record/read back the single checkpoint and stop. This native segment only pauses this workflow.'},
  {id:'C01-2',skill:'bfs-router',request:'Create and complete one small independent workflow for inspecting USER-NOTE.txt. Save its actual workflow ID in other-work.json. Confirm the paused workflow from seed.json remains paused and its checkpoint and memory history remain unchanged. Do not resume or export it in this segment.'},
  {id:'C01-3',skill:'bfs-load-context',request:'Read seed.json, resume/adopt its paused workflow in this new native task, then export the continuation to handoff.md. Verify both complete accepted memory revisions and the separate completed workflow ID in other-work.json. This is the final short segment; no product edits.'},
  {id:'M01-clear',skill:'bfs-plan-tune',request:'Configure the question-presentation preference from my explicit natural-language answer: “I want decision questions in chat so I can answer in one place.” Map it to the canonical option, save at user scope, read it back and refresh effective preferences. No other setting changes.'},
  {id:'M01-ambiguous',skill:'bfs-plan-tune',request:'My answer to the question-presentation choice is “whatever is easiest”. Treat that as ambiguous: ask one concise clarification and do not save or guess a preference.'},
  {id:'M02',skill:'bfs-plan-tune',request:'In this isolated fixture, set question-presentation at user scope to chat, at project scope to prefer-panel, and at this task scope to chat. Read effective preference and report the winning scope/value. Then reset only this task scope and read effective again. Preserve project and user choices.'},
  {id:'M03-browse',skill:'bfs-browse',request:'Can you save a reusable browser script for this website and run it next time? No site URL, sign-in or live session is supplied. Inspect the supported capability and report the result; do not invent or save a script or workflow.'},
  {id:'M03-scrape',skill:'bfs-scrape',request:'Can you save a reusable browser script to scrape this website each week? No site URL, data or session is supplied. Inspect the supported capability and report the result; do not invent or save a script or workflow.'},
  {id:'M04',skill:'bfs-load-context',request:'Resume the workflow in seed.json in this new chat. Its user decision is still unanswered. Report the waiting decision, keep dependent work pending, and do not invent the answer or start implementation.'}
];

function run(cwd,args){
  const r=spawnSync('git',['-C',cwd,...args],{encoding:'utf8',windowsHide:true});
  if(r.status!==0)throw Error(r.stderr||`git ${args.join(' ')} failed`);
  return r.stdout.trim();
}

export function createRemainingFixtures(root,plugin){
  const made=createMethodologyFixtures(root,path.resolve(plugin),cases);
  const manifestFile=path.join(root,'manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  manifest.timeoutMs=180000;
  const shared=manifest.runs.find(c=>c.case==='C01-1').project;
  for(const c of manifest.runs.filter(c=>c.case.startsWith('C01-'))){
    c.project=shared;
    c.before=snapshot(shared);
    c.base=run(shared,['rev-parse','HEAD']);
  }
  const env={...process.env,BFS_STATE_HOME:path.join(shared,'.bfs-state'),CODEX_THREAD_ID:'fixture-seed'};
  const catalog=loadCatalog(),ctx=context(shared,env);
  const w=workflow(ctx,'start',{goal:'Pause and resume the accepted context handoff fixture',skills:['bfs-load-context']},catalog);
  workflow(ctx,'begin',{id:w.id,step:'1',inputs:['spec.md']},catalog);
  const first=memory(ctx,'put',{kind:'plan',key:'accepted-context-plan',text:'Original accepted plan',details:'Keep the agreed workflow and all decisions.',source:'user-stated'});
  memory(ctx,'put',{kind:'plan',key:'accepted-context-plan',expectedId:first.id,text:'Revised accepted plan',details:'Resume in a new chat and export both revisions.',source:'user-stated'});
  fs.writeFileSync(path.join(shared,'seed.json'),JSON.stringify({workflowId:w.id,memory:[{kind:'plan',key:'accepted-context-plan'}]},null,2));
  fs.writeFileSync(path.join(shared,'other-work.json'),JSON.stringify({purpose:'created by C01-2',status:'pending'},null,2));
  fs.writeFileSync(path.join(shared,'.gitignore'),'.bfs-state/\n');
  run(shared,['add','.']);run(shared,['-c','user.name=Acceptance','-c','user.email=acceptance@localhost','commit','--quiet','-m','remaining acceptance fixture']);
  const base=run(shared,['rev-parse','HEAD']);
  for(const c of manifest.runs.filter(c=>c.case.startsWith('C01-'))){c.base=base;c.before=snapshot(shared);}

  const waiting=manifest.runs.find(c=>c.case==='M04');
  const wctx=context(waiting.project,{...process.env,BFS_STATE_HOME:path.join(waiting.project,'.bfs-state'),CODEX_THREAD_ID:'fixture-seed'});
  const pending=workflow(wctx,'start',{goal:'Wait for the user decision before implementing',skills:['bfs-implement']},catalog);
  workflow(wctx,'begin',{id:pending.id,step:'1',inputs:['spec.md']},catalog);
  workflow(wctx,'step',{id:pending.id,step:'1',status:'waiting',summary:'Awaiting the user decision between preserving the public API and replacing it.',decisions:['Do not change the API until the user selects an option.']},catalog);
  fs.writeFileSync(path.join(waiting.project,'seed.json'),JSON.stringify({workflowId:pending.id},null,2));
  fs.writeFileSync(path.join(waiting.project,'.gitignore'),'.bfs-state/\n');
  run(waiting.project,['add','.']);run(waiting.project,['-c','user.name=Acceptance','-c','user.email=acceptance@localhost','commit','--quiet','-m','waiting decision fixture']);
  waiting.base=run(waiting.project,['rev-parse','HEAD']);waiting.before=snapshot(waiting.project);

  fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));
  return {...made,cases:manifest.runs.map(c=>c.case)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [action,root,argument,...selected]=process.argv.slice(2);
  if(action==='create')console.log(JSON.stringify(createRemainingFixtures(path.resolve(root),path.resolve(argument))));
  else if(action==='run'){
    if(!fs.existsSync(argument))throw Error('Provide the verified Codex JavaScript entry path');
    const manifestFile=path.join(root,'manifest.json');
    const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
    manifest.timeoutMs??=180000;
    fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));
    const pluginFiles=manifest.pluginHashes;
    const selectedCases=selected.length?selected:manifest.runs.map(c=>c.case);
    const cwd=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
    const contextCases=selectedCases.filter(name=>name.startsWith('C01-'));
    const otherCases=selectedCases.filter(name=>!name.startsWith('C01-'));
    const runCases=names=>{
      if(!names.length)return;
      const result=spawnSync(process.execPath,['tests/methodology-acceptance.mjs','run',root,argument,...names],{cwd,encoding:'utf8',stdio:'inherit',windowsHide:true});
      if(result.status!==0)process.exitCode=result.status??1;
    };
    for(const name of ['C01-1','C01-2','C01-3'])if(contextCases.includes(name)){
      const current=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
      const row=current.runs.find(c=>c.case===name);
      row.initialBefore??=row.before;
      fs.writeFileSync(manifestFile,JSON.stringify(current,null,2));
      runCases([name]);
      const finished=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
      const next=finished.runs.find(c=>c.case===`C01-${Number(name.slice(-1))+1}`);
      if(next){next.initialBefore??=next.before;next.before=snapshot(row.project);}
      fs.writeFileSync(manifestFile,JSON.stringify(finished,null,2));
    }
    runCases(otherCases);
    const current=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
    for(const [file,hash] of Object.entries(pluginFiles)){
      const bytes=fs.readFileSync(path.join(manifest.plugin,file));
      const {createHash}=await import('node:crypto');
      if(createHash('sha256').update(bytes).digest('hex')!==hash)throw Error(`Frozen plugin changed: ${file}`);
    }
    console.log(JSON.stringify({root,runs:current.runs.filter(c=>selectedCases.includes(c.case)&&fs.existsSync(path.join(root,'evidence',c.id,'result.json'))).map(c=>{const r=JSON.parse(fs.readFileSync(path.join(root,'evidence',c.id,'result.json'),'utf8'));return {case:r.case,id:r.id,exit:r.exit,elapsedMs:r.elapsedMs,thread:r.thread,commands:r.commands.length,evidence:r.evidence};})}));
  }else throw Error('Use create <new-root> <plugin> or run <root> <codex-js-entry> [case IDs]');
}
