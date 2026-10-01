import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createMethodologyFixtures} from './methodology-acceptance.mjs';
import {snapshot} from './acceptance-fixtures.mjs';
import {context} from '../plugins/bontaflowstack/core/state.mjs';
import {workflow} from '../plugins/bontaflowstack/core/workflow.mjs';
import {memory} from '../plugins/bontaflowstack/core/memory.mjs';
import {handoff} from '../plugins/bontaflowstack/core/handoff.mjs';
import {loadCatalog} from '../plugins/bontaflowstack/core/catalog.mjs';

// The existing native runner records commands and real task IDs; assess traces,
// not merely the process exit code. These cases never publish or deploy.
const query=`import {execFileSync} from 'node:child_process';
const read=route=>JSON.parse(execFileSync('gh',['api',route],{encoding:'utf8',windowsHide:true}));
const release=read('repos/BillBalint-SM/bontaflowstack-workbook/releases/tags/v0.6.0');
const ref=read('repos/BillBalint-SM/bontaflowstack-workbook/git/ref/tags/v0.6.0');
let revision=ref.object.sha;
if(ref.object.type==='tag')revision=read('repos/BillBalint-SM/bontaflowstack-workbook/git/tags/'+revision).object.sha;
console.log(JSON.stringify({status:release.draft?'pending':'completed',provider:'github',target:'github-release:v0.6.0',revision,version:release.tag_name.slice(1),reference:release.html_url}));
`;
const cases=[
  {id:'N01',skill:'bfs-save-context',request:'The current accepted spec.md workflow is selected in seed.json. I request its inspected adoption and continuation in this native task, then save/pause it with the existing decisions. Start one other small workflow and preserve it; resume/adopt the first and export it to handoff.md including both complete accepted-plan memory revisions. Verify read-back and preservation of the other workflow. The scope is local context operations, no product edits.'},
  {id:'N02',skill:'bfs-load-context',request:'Import selected incoming.md and inspect its complete memory history and workflow. spec.md changed and required.patch is missing since export. Report exactly what is stale or blocked before dependent implementation. Prior trace says an external operation succeeded but its save failed: recover by a selected read-only node query.mjs status check; do not repeat the operation. Return the recovered state; no implementation or publication.',drift:true},
  {id:'N03',skill:'bfs-finisher',request:'Prepare this already-correct CLI change locally, with separate Standards/Spec review and node test.mjs. Record prepare evidence and derive a report for only the requested prepare stage. Finish without publication or a retro interview. Preserve USER-NOTE.txt.'},
  {id:'N04',skill:'bfs-prod-deploy',request:'Verify the existing public GitHub release v0.6.0 using the real read-only query.mjs. Record workflow-bound verify evidence with provider github, target github-release:v0.6.0, actual fixture HEAD as sourceRevision, expected revision 8eec8281060ccbdb0c947330b64b767c22d541c8 and version 0.6.0. Execute a new explicitly selected status query through delivery verify and report identity/freshness. This observes an existing release; it does not deliver the fixture or these plugin changes.'},
  {id:'N05',skill:'bfs-retro',request:'Review trace.json, which records actual CLI failure and recovery. Report the mechanical defect, whether existing test.mjs catches it, and uncertainty about why it happened. Save the observed lesson under stable learning key greeting-regression with its real trace source; propose any remedy as inferred, not accepted. Revise that learning with expectedId, preserving history. No rule, CI, hook or global instruction edits.',trace:true},
  {id:'N06',skill:'bfs-retro',request:'We chose a design and later disliked it. No user research or session trace exists. Report what can and cannot be concluded and a targeted way to evaluate that judgment. Inspect only; do not invent a root cause, persist learning or write rules.'},
  {id:'N07',skill:'bfs-load-context',request:'I accept current spec.md and request the complete local continuation from incoming.md: import and check drift, start an owned workflow, verify the already-correct CLI with test.mjs, record local prepare evidence, then observe the existing v0.6.0 GitHub release through the real read-only query.mjs and fresh delivery verify. This query proves only the existing release. Review the actual failure/recovery trace.json through bfs-retro and save a trace-backed project learning, then close your workflow and retire the imported checkpoint from active context. Read context show to verify closure while history remains readable. No actual publication/deployment, product edits or rule/CI/hook changes.',trace:true},
  {id:'N08',skill:'bfs-save-context',request:'Export only: select the existing workflowId and memory selectors in seed.json, export to handoff.md with next action Run the accepted CLI check, and verify read-back contains both full plan revisions. Finish the export branch; preserve existing workflow, memory and checkpoints. This task requests no new snapshot, pause, adoption, implementation or publication.'},
  {id:'N09',skill:'bfs-save-context',request:'Pause the local accepted spec.md work so I can switch tasks. There is no saved workflow yet; create an owned one for this current context, then pause it with the decision to preserve the CLI and the remaining action to run test.mjs later. Return its verified checkpoint. Scope: pause/context only, no product changes or publication.'}
];

export function createClosureFixtures(root,plugin){
  createMethodologyFixtures(root,plugin,cases.map(c=>({...c,network:['N02','N04','N07'].includes(c.id)})));
  const file=path.join(root,'manifest.json'),manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const c of manifest.runs){
    fs.writeFileSync(path.join(c.project,'query.mjs'),query);
    if(['N01','N08'].includes(c.case)){
      const ctx=context(c.project,{...process.env,BFS_STATE_HOME:path.join(c.project,'.bfs-state'),CODEX_THREAD_ID:'fixture-seed'}),catalog=loadCatalog();
      const w=workflow(ctx,'start',{goal:'Continue the accepted public CLI specification',skills:['bfs-implement']},catalog);
      workflow(ctx,'begin',{id:w.id,step:'1',inputs:['spec.md']},catalog);
      const original=memory(ctx,'put',{kind:'plan',key:'accepted-plan',text:'Original plan',details:'Preserve the public CLI and exported greeting.',source:'user-stated'});
      memory(ctx,'put',{kind:'plan',key:'accepted-plan',expectedId:original.id,text:'Revised plan',details:'Use the existing test and keep delivery separate.',source:'user-stated'});
      fs.writeFileSync(path.join(c.project,'seed.json'),JSON.stringify({workflowId:w.id,memory:[{kind:'plan',key:'accepted-plan'}],decisions:['Current spec.md is accepted; product files remain unchanged.']},null,2));
      fs.writeFileSync(path.join(c.project,'.gitignore'),'.bfs-state/\n');
    }
    if(c.trace){
      const app=path.join(c.project,'app.mjs'),green=fs.readFileSync(app,'utf8');
      fs.writeFileSync(app,'export const greeting = name => `Hi, ${name}`;\n');
      const run=()=>{const r=spawnSync(process.execPath,['test.mjs'],{cwd:c.project,encoding:'utf8',windowsHide:true});return {command:['node','test.mjs'],exit:r.status,stdout:r.stdout,stderr:r.stderr,inputs:snapshot(c.project)};};
      const failed=run();fs.writeFileSync(app,green);const recovered=run();
      if(failed.exit===0 || recovered.exit!==0)throw Error('Trace must contain actual failed and recovered checks');
      fs.writeFileSync(path.join(c.project,'trace.json'),JSON.stringify({failed,recovered},null,2));
    }
    if(['N02','N07'].includes(c.case)){
      const ctx=context(c.project,{...process.env,BFS_STATE_HOME:path.join(root,'seed-state',c.id),CODEX_THREAD_ID:'fixture-seed'}),catalog=loadCatalog();
      const w=workflow(ctx,'start',{goal:'Continue accepted CLI verification',skills:['bfs-implement']},catalog);
      workflow(ctx,'begin',{id:w.id,step:'1',inputs:['spec.md']},catalog);
      let plan=memory(ctx,'put',{kind:'plan',key:'accepted-plan',text:'Original complete plan',details:'Preserve public CLI and existing exported function.',source:'user-stated'});
      memory(ctx,'put',{kind:'plan',key:'accepted-plan',expectedId:plan.id,text:'Revised complete plan',details:'Verify CLI, keep publication separate, preserve source history.',source:'user-stated'});
      workflow(ctx,'pause',{id:w.id,summary:'Accepted basis saved; no product change required',remaining:c.drift?['Missing required.patch blocks dependent repair','External action success was observed but its save failed; query before retry']:['Verify accepted CLI locally and inspect existing release']},catalog);
      handoff(ctx,'export',{id:w.id,memory:[{kind:'plan',key:'accepted-plan'}],output:path.join(c.project,'incoming.md')},catalog);
      if(c.drift)fs.appendFileSync(path.join(c.project,'spec.md'),'Changed constraint: the missing required.patch is required before implementation.\n');
    }
    for(const args of [['add','.'],['-c','user.name=Acceptance','-c','user.email=acceptance@localhost','commit','--quiet','-m','closure fixture inputs']]){
      const r=spawnSync('git',args,{cwd:c.project,encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr);
    }
    c.before=snapshot(c.project);c.base=spawnSync('git',['rev-parse','HEAD'],{cwd:c.project,encoding:'utf8',windowsHide:true}).stdout.trim();
    if(c.case==='N08')c.stateBefore=snapshot(path.join(c.project,'.bfs-state'));
  }
  fs.writeFileSync(file,JSON.stringify(manifest,null,2));return {root,runs:manifest.runs.length};
}
if(process.argv[2]==='create')console.log(JSON.stringify(createClosureFixtures(path.resolve(process.argv[3]),path.resolve(process.argv[4]))));
