import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { context, atomicWrite, readJson, changeJson, digest, fingerprints } from '../plugins/bontaflowstack/core/state.mjs';
import { workflow, stopWorkflows } from '../plugins/bontaflowstack/core/workflow.mjs';
import { memory, preferences } from '../plugins/bontaflowstack/core/memory.mjs';
import { guard, preTool, classify } from '../plugins/bontaflowstack/core/guard.mjs';
import { delivery, versionNext } from '../plugins/bontaflowstack/core/delivery.mjs';
import { engines } from '../plugins/bontaflowstack/core/engines.mjs';
import { checkLocalLinks } from '../scripts/check.mjs';
import { loadCatalog, resolveSkill, pluginRoot } from '../plugins/bontaflowstack/core/cli.mjs';

const catalog = loadCatalog();
function hookCommand(event = 'PreToolUse') {
  const hook = readJson(path.join(pluginRoot,'hooks/hooks.json')).hooks[event][0].hooks[0];
  assert.equal(hook.command,hook.commandWindows);
  return hook.commandWindows.match(/ -Command "(.+)"$/)[1];
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'bfs-core-'));
  const project = path.join(root,'project'); fs.mkdirSync(project);
  const env = { ...process.env, BFS_STATE_HOME:path.join(root,'state'), CODEX_THREAD_ID:'fixture-task' };
  const ctx = context(project,env);
  t.after(() => {
    assert.equal(path.dirname(root),fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(root),/^bfs-core-/);
    fs.rmSync(root,{recursive:true,force:true});
  });
  return {root,project,env,ctx};
}
const expected = catalog.skills.map(s=>s.id);

test('catalog exposes exactly the selected skills and preserves alias modes', () => {
  assert.deepEqual(fs.readdirSync(path.join(pluginRoot,'skills')).sort(),[...expected].sort());
  for (const skill of catalog.skills) {
    for (const target of skill.handoffs) assert.ok(expected.includes(target), `${skill.id} -> ${target}`);
    const file = path.join(pluginRoot,'skills',skill.id,'SKILL.md');
    const body = fs.readFileSync(file,'utf8');
    assert.ok(body.startsWith(`---\nname: ${skill.id}\n`));
    checkLocalLinks(file);
  }
  for (const name of Object.keys(catalog.aliases)) assert.ok(expected.includes(resolveSkill(name).id));
  assert.equal(resolveSkill('qa-only').mode,'inspect');
  assert.equal(resolveSkill('unfreeze').mode,'release');
  assert.equal(resolveSkill('bfs implement').id,'bfs-implement');
  assert.equal(resolveSkill('$bfs-router').id,'bfs-router');
  assert.equal(resolveSkill('$bfs-business-builder').id,'bfs-business-builder');
  assert.equal(resolveSkill('bfs-driver').id,'bfs-router');
  assert.equal(resolveSkill('business-driver').id,'bfs-business-builder');
  assert.throws(()=>resolveSkill('skillify'),/removed/);
});

test('implementation records an accepted basis, preserves waiting and detects changed inputs', t => {
  const {ctx,project}=fixture(t);
  fs.writeFileSync(path.join(project,'spec.md'),'Return the agreed greeting.');
  const started=workflow(ctx,'start',{goal:'Implement the greeting',route:'implementation'},catalog);
  assert.deepEqual(started.steps.map(step=>step.skill),['bfs-implement','bfs-health','bfs-review']);
  assert.equal(started.steps[0].mode,'implement');
  workflow(ctx,'begin',{id:started.id,step:'1',inputs:['spec.md']},catalog);
  workflow(ctx,'step',{id:started.id,step:'1',status:'waiting',summary:'Awaiting user acceptance of spec.md'},catalog);
  assert.equal(stopWorkflows(ctx).changed,0);
  assert.throws(()=>workflow(ctx,'begin',{id:started.id,step:'2'},catalog),/unresolved/);
  // Fixture data exercises storage, not authentication of a real user decision.
  const acceptance=workflow(ctx,'save',{goal:'Implement the greeting',summary:'Accepted greeting specification',decisions:['Fixture user: implement this version of spec.md'],files:['spec.md']},catalog);
  assert.equal(acceptance.files[0].sha256,digest('Return the agreed greeting.'));
  workflow(ctx,'begin',{id:started.id,step:'1',inputs:['spec.md']},catalog);
  fs.writeFileSync(path.join(project,'greeting.txt'),'Hello');
  workflow(ctx,'step',{id:started.id,step:'1',status:'completed',summary:'Greeting implemented',evidence:['Read greeting.txt: Hello'],outputs:['greeting.txt'],decisions:['Acceptance checkpoint: '+acceptance.id]},catalog);
  workflow(ctx,'begin',{id:started.id,step:'2'},catalog);
  fs.writeFileSync(path.join(project,'spec.md'),'Return a different greeting.');
  const resumed=workflow(ctx,'resume',{id:started.id},catalog);
  assert.ok(resumed.drift.some(change=>change.path==='spec.md'));
  assert.equal(resumed.steps[0].decisions[0],'Acceptance checkpoint: '+acceptance.id);
});

test('read-only operations do not initialize state and separate same-name projects', t => {
  const {root,env,ctx}=fixture(t);
  assert.deepEqual(memory(ctx,'list'),[]);
  assert.equal(preferences(ctx,'inspect').enabled,false);
  assert.deepEqual(workflow(ctx,'list',{},catalog),[]);
  assert.equal(engines(ctx,'status').installed,false);
  assert.equal(fs.existsSync(ctx.home),false);
  const other=path.join(root,'other','project'); fs.mkdirSync(other,{recursive:true});
  assert.notEqual(context(other,env).projectId,ctx.projectId);
  assert.equal(ctx.git,false);
});

test('workflow checkpoints bind file content, stop at stale inputs and resume in a new task', t => {
  const {ctx,project,env}=fixture(t);
  fs.writeFileSync(path.join(project,'brief.md'),'version one');
  const started=workflow(ctx,'start',{goal:'Specify the offer',skills:['bfs-business-builder','bfs-spec']},catalog);
  workflow(ctx,'begin',{id:started.id,step:'1',inputs:['brief.md']},catalog);
  workflow(ctx,'step',{id:started.id,step:'1',status:'completed',summary:'Brief checked',evidence:['Read the supplied brief and checked target audience'],outputs:['brief.md']},catalog);
  const resumed=workflow(context(project,{...env,CODEX_THREAD_ID:'next-task'}),'resume',{id:started.id},catalog);
  assert.equal(resumed.requiresAdoption,true); assert.deepEqual(resumed.drift,[]);
  fs.writeFileSync(path.join(project,'brief.md'),'version two');
  assert.throws(()=>workflow(ctx,'begin',{id:started.id,step:'2'},catalog),/stale/);
  assert.equal(workflow(ctx,'resume',{id:started.id},catalog).drift.length,1);
  const snapshot=workflow(ctx,'save',{goal:'Specify the offer',summary:'Saved draft',files:['brief.md'],remaining:['Review change']},catalog);
  assert.equal(readJson(snapshot.file).files[0].sha256,digest('version two'));
});

test('a changed input cannot be certified as a completed step', t => {
  const {ctx,project}=fixture(t);
  fs.writeFileSync(path.join(project,'code.js'),'one');
  const started=workflow(ctx,'start',{goal:'Review',skills:['bfs-review']},catalog);
  workflow(ctx,'begin',{id:started.id,step:'1',inputs:['code.js']},catalog);
  fs.writeFileSync(path.join(project,'code.js'),'two');
  assert.throws(()=>workflow(ctx,'step',{id:started.id,step:'1',status:'completed',summary:'Reviewed',evidence:['Observed the prior content']},catalog),/Inputs changed/);
  assert.equal(workflow(ctx,'resume',{id:started.id},catalog).steps[0].status,'running');
});

test('reopening a step invalidates downstream results and preserves selected modes and history', t => {
  const {ctx}=fixture(t);
  const started=workflow(ctx,'start',{goal:'Inspect then document',skills:[{skill:'bfs-qa',mode:'inspect'},'bfs-documentation']},catalog);
  for(const step of ['1','2']) {
    workflow(ctx,'begin',{id:started.id,step},catalog);
    workflow(ctx,'step',{id:started.id,step,status:'completed',summary:'Verified fixture result',evidence:['Test fixture completion']},catalog);
  }
  const reopened=workflow(ctx,'begin',{id:started.id,step:'1'},catalog);
  assert.equal(reopened.steps[0].mode,'inspect');
  assert.equal(reopened.steps[1].status,'pending');
  assert.equal(reopened.steps[1].history[0].status,'completed');
  assert.equal(reopened.status,'running');
});

test('legacy context imports preserve bytes and never import permissions', t => {
  const {ctx,root}=fixture(t);
  const file=path.join(root,'old.md'), original='# Prior work\nDeployment was discussed.';
  fs.writeFileSync(file,original);
  assert.equal(workflow(ctx,'import-legacy',{file},catalog).preview,true);
  const result=workflow(ctx,'import-legacy',{file,goal:'Resume review',confirm:'import'},catalog);
  assert.equal(result.authorizationImported,false);
  assert.equal(workflow(ctx,'import-legacy',{file,goal:'Resume review',confirm:'import'},catalog).id,result.id);
  assert.equal(fs.readFileSync(file,'utf8'),original);
});

test('Git worktrees share memory while keeping workflow and task state separate', t => {
  const {ctx,env,project,root}=fixture(t);
  function git(args) { const r=spawnSync('git',['-C',project,...args],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);return r; }
  git(['init','-b','main']); git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','Initial fixture']);
  const linked=path.join(root,'linked'); git(['worktree','add','--detach',linked]);
  const one=context(project,env),two=context(linked,env);
  assert.equal(one.projectId,two.projectId); assert.notEqual(one.workspaceId,two.workspaceId);
  memory(one,'put',{kind:'decision',key:'shared',text:'Shared project choice',source:'user-stated'});
  assert.equal(memory(two,'list')[0].key,'shared');
  const checkpoint=workflow(one,'save',{goal:'Check context',summary:'Before commit'},catalog);
  git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','Next fixture']);
  assert.ok(workflow(one,'resume',{id:checkpoint.id},catalog).environmentChanges.some(change=>change.key==='head'));
});

test('stop marks only active steps in this task and preserves waiting work', t => {
  const {ctx,env,project}=fixture(t);
  const running=workflow(ctx,'start',{goal:'Active',skills:['bfs-spec']},catalog);
  workflow(ctx,'begin',{id:running.id,step:'1'},catalog);
  const waiting=workflow(ctx,'start',{goal:'Waiting',skills:['bfs-spec']},catalog);
  workflow(ctx,'begin',{id:waiting.id,step:'1'},catalog);
  workflow(ctx,'step',{id:waiting.id,step:'1',status:'waiting',summary:'Needs a product choice'},catalog);
  assert.equal(stopWorkflows(context(project,{...env,CODEX_THREAD_ID:'different'})).changed,0);
  assert.equal(stopWorkflows(ctx).changed,1);
  assert.equal(workflow(ctx,'resume',{id:running.id},catalog).status,'interrupted');
  assert.equal(workflow(ctx,'resume',{id:waiting.id},catalog).status,'waiting');
  assert.equal(stopWorkflows(ctx).changed,0);
});

test('atomic failure and write contention retain the previous bytes', t => {
  const {ctx}=fixture(t), file=path.join(ctx.home,'record.json');
  atomicWrite(file,{value:1}); const old=fs.readFileSync(file,'utf8');
  const realRename=fs.renameSync;
  t.mock.method(fs,'renameSync',()=>{throw new Error('injected disk failure');});
  assert.deepEqual(changeJson(file,null,current=>current),{value:1});
  assert.throws(()=>atomicWrite(file,{value:2}),/disk failure/);
  assert.equal(fs.readFileSync(file,'utf8'),old);
  fs.renameSync=realRename;
  fs.mkdirSync(`${file}.lock`);
  assert.throws(()=>changeJson(file,null,()=>({value:3})),/another process/);
  assert.equal(fs.readFileSync(file,'utf8'),old);
});

test('a transient Windows lock error is retried without losing the update', t => {
  const {ctx}=fixture(t), file=path.join(ctx.home,'record.json');
  const mkdir=fs.mkdirSync;
  let failures=0;
  fs.mkdirSync=(target,...args) => {
    if (target === `${file}.lock` && failures++ === 0) throw Object.assign(new Error('transient lock error'),{code:'EPERM'});
    return mkdir(target,...args);
  };
  try { assert.deepEqual(changeJson(file,null,()=>({value:1})),{value:1}); }
  finally { fs.mkdirSync=mkdir; }
  assert.equal(failures,2);
  assert.deepEqual(readJson(file),{value:1});
});

test('memory keeps revisions, prunes exact IDs and imports legacy data without changing it', t => {
  const {ctx,root}=fixture(t);
  memory(ctx,'put',{kind:'learning',key:'retry',text:'first',source:'observed'});
  const second=memory(ctx,'put',{kind:'learning',key:'retry',text:'second',source:'user-stated'});
  assert.equal(memory(ctx,'search',{query:'second'})[0].text,'second');
  assert.equal(memory(ctx,'stats').records,2);
  memory(ctx,'prune',{ids:[second.id]});
  assert.equal(memory(ctx,'list')[0].text,'first');
  const legacy=path.join(root,'legacy.jsonl'), raw=JSON.stringify({insight:'Imported lesson',key:'old'})+'\n';
  fs.writeFileSync(legacy,raw);
  assert.equal(memory(ctx,'import-legacy',{file:legacy}).preview,true);
  memory(ctx,'import-legacy',{file:legacy,confirm:'import'});
  memory(ctx,'import-legacy',{file:legacy,confirm:'import'});
  assert.equal(memory(ctx,'stats').current,2);
  assert.equal(fs.readFileSync(legacy,'utf8'),raw);
});

test('preferences are scoped, advisory, validated and require a selected proposal', t => {
  const {ctx}=fixture(t);
  assert.throws(()=>preferences(ctx,'set',{id:'publish-approval',question:'Publish?',options:['yes','no'],choice:'yes'}),/optional/);
  preferences(ctx,'set',{id:'detail-preference',question:'Depth?',options:['brief','full'],choice:'brief',scope:'user'});
  preferences(ctx,'set',{id:'detail-preference',question:'Depth?',options:['brief','full'],choice:'full'});
  assert.equal(preferences(ctx,'effective').values['detail-preference'].choice,'full');
  assert.throws(()=>preferences(ctx,'profile',{values:{autonomy:2}}),/Invalid/);
  const result=preferences(ctx,'propose',{kind:'profile',value:{values:{detail_preference:0.5}},source:'User requested balanced explanations'});
  assert.throws(()=>preferences(ctx,'apply',{id:result.proposals[0].id}),/confirm/);
  preferences(ctx,'apply',{id:result.proposals[0].id,confirm:'apply'});
  assert.equal(preferences(ctx,'inspect').profile.detail_preference,0.5);
});

test('question presentation preserves old stores, validates choices and inherits scoped overrides', t => {
  const {ctx}=fixture(t);
  const request={id:'question-presentation',question:'Panel or chat?',options:['prefer-panel','chat']};
  assert.equal(preferences(ctx,'effective').values[request.id],undefined);
  assert.equal(fs.existsSync(ctx.home),false);
  preferences(ctx,'set',{id:'detail-preference',question:'Depth?',options:['brief','full'],choice:'brief',scope:'user'});
  const file=path.join(ctx.home,'preferences.json'), old=fs.readFileSync(file,'utf8');
  assert.equal(preferences(ctx,'effective').values[request.id],undefined);
  assert.equal(fs.readFileSync(file,'utf8'),old);
  preferences(ctx,'set',{...request,choice:'prefer-panel'});
  assert.equal(preferences(ctx,'inspect',{scope:'user'}).values[request.id].choice,'prefer-panel');
  assert.equal(preferences(ctx,'inspect').values[request.id],undefined);
  const saved=fs.readFileSync(file,'utf8');
  assert.throws(()=>preferences(ctx,'set',{...request,options:['prefer-panel','other'],choice:'other'}),/question presentation/);
  assert.throws(()=>preferences(ctx,'set',{...request,options:['prefer-panel','chat','other'],choice:'chat'}),/question presentation/);
  assert.equal(fs.readFileSync(file,'utf8'),saved);
  preferences(ctx,'set',{...request,choice:'chat',scope:'project'});
  assert.equal(preferences(ctx,'effective').values[request.id].choice,'chat');
  preferences(ctx,'set',{...request,choice:'prefer-panel',scope:'task'});
  assert.equal(preferences(ctx,'effective').values[request.id].choice,'prefer-panel');
  preferences(ctx,'reset',{id:request.id,scope:'task'});
  assert.equal(preferences(ctx,'effective').values[request.id].choice,'chat');
  preferences(ctx,'reset',{id:request.id,scope:'project'});
  assert.equal(preferences(ctx,'effective').values[request.id].choice,'prefer-panel');
  preferences(ctx,'reset',{id:request.id});
  assert.equal(preferences(ctx,'effective').values[request.id],undefined);
  assert.equal(preferences(ctx,'inspect',{scope:'user'}).values['detail-preference'].choice,'brief');
  assert.equal(readJson(file).schema,1);
  const malformed=readJson(file);malformed.values[request.id]={choice:'other'};
  atomicWrite(file,malformed);
  assert.throws(()=>preferences(ctx,'effective'),/question presentation/);
});

test('retrying a memory operation after an uncertain result does not duplicate it', t => {
  const {ctx}=fixture(t), request={kind:'decision',key:'retry',text:'Confirmed choice',source:'user-stated',operationId:'request-1'};
  const first=memory(ctx,'put',request), again=memory(ctx,'put',request);
  assert.equal(first.id,again.id); assert.equal(memory(ctx,'stats').records,1);
  assert.throws(()=>memory(ctx,'put',{...request,text:'Different choice'}),/different/);
});

test('credential-shaped input and state links are rejected without data loss', t => {
  const {ctx,root}=fixture(t);
  assert.throws(()=>atomicWrite(path.join(ctx.home,'secret.json'),{api_key:'example'}),/Credential/);
  fs.mkdirSync(ctx.home,{recursive:true}); const outside=path.join(root,'outside'); fs.mkdirSync(outside);
  const linked=path.join(ctx.home,'linked'); fs.symlinkSync(outside,linked,process.platform==='win32'?'junction':'dir');
  assert.throws(()=>atomicWrite(path.join(linked,'note.json'),{value:1}),/link/);
  assert.equal(fs.existsSync(path.join(outside,'note.json')),false);
});

test('guard fixture enforces edit targets and independent toggles; fixture is not native proof', t => {
  const {ctx,project}=fixture(t); fs.mkdirSync(path.join(project,'src'));
  const event={hook_event_name:'PreToolUse',session_id:ctx.taskId,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git status'}};
  const observation=preTool(ctx,event).hookSpecificOutput.additionalContext;
  guard(ctx,'set',{observation,warnings:true,boundary:'src'});
  const denied=preTool(ctx,{...event,tool_name:'functions.apply_patch',tool_input:{command:'*** Begin Patch\n*** Add File: outside.txt\n+x\n*** End Patch'}});
  assert.equal(denied.hookSpecificOutput.permissionDecision,'deny');
  guard(ctx,'release',{observation});
  assert.equal(guard(ctx,'status').warnings,true); assert.equal(guard(ctx,'status').boundary,null);
});

test('guard recognizes destructive commands with global Git options and PowerShell aliases', t => {
  const {ctx,project,root}=fixture(t);
  assert.equal(classify('git -c core.pager=cat reset --hard',project,project).decision,'ask');
  const rootDelete=classify(`Remove-Item -LiteralPath '${project}' -Recurse -Force`,project,project);
  assert.equal(rootDelete.decision,'deny',JSON.stringify({rootDelete,project,canonical:ctx.workspace}));
  assert.match(rootDelete.reason,/project or an ancestor/);
  assert.equal(classify('ri src -Recurse',project,project).decision,'ask');
  assert.equal(classify('git status --short',project,project),null);
  assert.equal(classify('git status --short; git reset --hard',project,project).decision,'ask');
  assert.equal(classify('git status --short | Invoke-Expression',project,project).decision,'ask');
  const alias=path.join(root,'project-alias'); fs.symlinkSync(project,alias,process.platform==='win32'?'junction':'dir');
  assert.equal(classify(`Remove-Item -LiteralPath '${project}' -Recurse`,alias,alias).decision,'deny');
});

test('guard blocks a warning until the exact operation has a single-use confirmation', t => {
  const {ctx,project}=fixture(t);
  const event={hook_event_name:'PreToolUse',session_id:ctx.taskId,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git reset --hard'}};
  const observation=preTool(ctx,event).hookSpecificOutput.additionalContext;
  guard(ctx,'set',{observation,warnings:true});
  assert.equal(preTool(ctx,event).hookSpecificOutput.permissionDecision,'deny');
  const pending=guard(ctx,'status').pending;
  guard(ctx,'approve',{observation,id:pending.id,confirmation:'Fixture authorizes the exact simulated reset; no command executes in this test'});
  assert.equal(preTool(ctx,event).hookSpecificOutput.permissionDecision,undefined);
  assert.equal(preTool(ctx,event).hookSpecificOutput.permissionDecision,'deny');
});

test('guard covers destructive Git aliases and default worktree restores', t => {
  const {ctx,project}=fixture(t);
  const event={hook_event_name:'PreToolUse',session_id:ctx.taskId,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git status --short'}};
  const observation=preTool(ctx,event).hookSpecificOutput.additionalContext;
  guard(ctx,'set',{observation,warnings:true});
  for (const cmd of ['git clean --force','git -C . clean --force','git restore file.txt','git restore -W file.txt',
    'git checkout -- file.txt','git checkout HEAD -- file.txt','git branch --delete --force fixture','git branch -df fixture']) {
    const call={...event,tool_input:{cmd}};
    assert.equal(classify(cmd,project,project)?.decision,'ask',cmd);
    assert.equal(preTool(ctx,call).hookSpecificOutput.permissionDecision,'deny',cmd);
    guard(ctx,'approve',{observation,id:guard(ctx,'status').pending.id,confirmation:'Fixture authorizes this exact simulated command; it is never executed'});
    assert.equal(preTool(ctx,call).hookSpecificOutput.permissionDecision,undefined,cmd);
    assert.equal(preTool(ctx,call).hookSpecificOutput.permissionDecision,'deny',cmd);
  }
  for (const cmd of ['git status --short','git clean --dry-run','git checkout fixture','git branch --list --force',
    'git restore --help','git restore --staged file.txt']) assert.equal(classify(cmd,project,project),null,cmd);
});

test('delivery preserves command exit and rejects stale evidence', t => {
  const {ctx,project}=fixture(t);
  fs.writeFileSync(path.join(project,'input.txt'),'one');
  const failed=delivery(ctx,'evidence',{label:'nonzero',command:[process.execPath,'-e','process.exit(7)'],files:['input.txt']});
  assert.equal(failed.exitCode,7); assert.equal(failed.status,'failed');
  const passed=delivery(ctx,'evidence',{label:'read',command:[process.execPath,'-e','console.log("checked")'],files:['input.txt']});
  assert.equal(delivery(ctx,'verify',{id:passed.id}).valid,true);
  fs.writeFileSync(path.join(project,'input.txt'),'two');
  assert.equal(delivery(ctx,'verify',{id:passed.id}).valid,false);
  assert.equal(versionNext('1.2.3.4','micro'),'1.2.3.5');
  assert.equal(versionNext('1.2.3.4','minor'),'1.3.0.0');
});

test('PowerShell launcher resolves a renamed skill and reads from a fresh package path', t => {
  const {env,project}=fixture(t);
  const result=spawnSync('powershell.exe',['-NoProfile','-File',path.join(pluginRoot,'scripts/bfstack.ps1'),'-Command','catalog','-Action','resolve','bfstack'],{cwd:project,env,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr);
  assert.equal(JSON.parse(result.stdout).id,'bfs-router');
});

test('Node engine bridge preserves failures and isolates missing external design tools', t => {
  const {ctx,root}=fixture(t), engine=path.join(root,'engine');
  fs.mkdirSync(path.join(engine,'src'),{recursive:true});fs.mkdirSync(path.join(engine,'.browsers'));
  const source='process.stdout.write(JSON.stringify({session:process.env.BFS_ENGINE_SESSION}));process.exit(7);';
  fs.writeFileSync(path.join(engine,'src','probe.mjs'),source);
  const manifest={schema:1,name:'bontaflowstack-engines',version:'0.3.0',platform:`${process.platform}-${process.arch}`,browserDirectory:'.browsers',
    files:{'src/probe.mjs':digest(source)},commands:{browser:{program:'node',args:['src/probe.mjs'],requires:['src/probe.mjs']},
      'design-md':{program:'node',args:['src/probe.mjs'],requires:['src/probe.mjs'],environment:'BFS_TEST_MISSING_COMMAND'}}};
  const bytes=JSON.stringify(manifest);fs.writeFileSync(path.join(engine,'engine.json'),bytes);
  engines(ctx,'register',{root:engine,sha256:digest(bytes)});
  const state=engines(ctx,'status');assert.equal(state.capabilities.browser.ready,true);assert.equal(state.capabilities['design-md'].ready,false);
  const result=engines(ctx,'browser',{args:['status']});assert.equal(result.exitCode,7);assert.equal(result.status,'failed');
  assert.ok(JSON.parse(result.stdout).session.startsWith(ctx.workspaceDir));
});

test('PowerShell native-hook command forwards UTF-8 stdin and returns the host contract', t => {
  const {env,project}=fixture(t);
  const payload={hook_event_name:'PreToolUse',session_id:env.CODEX_THREAD_ID,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git status'}};
  const command=hookCommand();
  const result=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',command],{cwd:project,env:{...env,PLUGIN_ROOT:pluginRoot},input:JSON.stringify(payload),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);
  assert.match(JSON.parse(result.stdout).hookSpecificOutput.additionalContext,/BFS_GUARD_OBSERVED/);
});

test('native hook preserves inspection failure exit codes and Stop success', t => {
  const {env,project}=fixture(t);
  for (const [event,code] of [['PreToolUse',2],['Stop',0]]) {
    const payload={hook_event_name:event,session_id:env.CODEX_THREAD_ID,cwd:project,tool_name:'functions.exec_command',tool_input:null};
    const result=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',hookCommand(event)],{cwd:project,env:{...env,PLUGIN_ROOT:pluginRoot},input:JSON.stringify(payload),encoding:'utf8',windowsHide:true,timeout:8000});
    assert.equal(result.status,code,result.stderr || result.stdout);
    if(event==='PreToolUse') assert.match(JSON.parse(result.stdout).hookSpecificOutput.permissionDecisionReason,/Malformed native tool input/);
    else assert.deepEqual(JSON.parse(result.stdout),{});
  }
});

test('parallel native hooks refresh missing and stale observations and wait for a writer', async t => {
  const {env,project,root}=fixture(t);
  for(const mode of ['missing','stale','locked']) {
    const runEnv={...env,PLUGIN_ROOT:pluginRoot,BFS_STATE_HOME:path.join(root,mode)};
    const ctx=context(project,runEnv);
    const observed=path.join(ctx.workspaceDir,'tasks',`${ctx.taskId}.guard.json.observed.json`);
    if(mode==='stale') atomicWrite(observed,{taskId:ctx.taskId,workspaceId:ctx.workspaceId,at:'2000-01-01T00:00:00.000Z',package:'0.3.0'});
    let release=Promise.resolve();
    if(mode==='locked') {
      fs.mkdirSync(`${observed}.lock`,{recursive:true});
      release=new Promise(resolve=>setTimeout(()=>{ fs.rmdirSync(`${observed}.lock`); resolve(); },700));
    }
    const payload={hook_event_name:'PreToolUse',session_id:ctx.taskId,cwd:project,tool_name:'functions.exec_command',tool_input:{cmd:'git status'}};
    const results=await Promise.all(Array.from({length:8},()=>new Promise(resolve=>{
      const child=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',hookCommand()],{cwd:project,env:runEnv,windowsHide:true,timeout:8000});
      let stdout='',stderr='';
      child.stdout.on('data',data=>stdout+=data); child.stderr.on('data',data=>stderr+=data);
      child.on('error',error=>resolve({error:error.message}));
      child.on('close',code=>resolve({code,stdout,stderr}));
      child.stdin.end(JSON.stringify(payload));
    })));
    await release;
    for(const result of results) {
      assert.equal(result.code,0,`${mode}: ${JSON.stringify(result)}`);
      assert.match(JSON.parse(result.stdout).hookSpecificOutput.additionalContext,/BFS_GUARD_OBSERVED/);
    }
    const saved=readJson(observed);
    assert.equal(saved.taskId,ctx.taskId); assert.equal(saved.workspaceId,ctx.workspaceId);
    assert.ok(Date.now()-Date.parse(saved.at)<10000);
    assert.equal(fs.existsSync(`${observed}.lock`),false);
  }
});
