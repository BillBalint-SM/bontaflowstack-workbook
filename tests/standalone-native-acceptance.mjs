import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createMethodologyFixtures, cases as runCases} from './methodology-acceptance.mjs';
import {snapshot} from './acceptance-fixtures.mjs';
import {context, digest} from '../plugins/bontaflowstack/core/state.mjs';
import {memory} from '../plugins/bontaflowstack/core/memory.mjs';
import {workflow} from '../plugins/bontaflowstack/core/workflow.mjs';
import {loadCatalog} from '../plugins/bontaflowstack/core/catalog.mjs';

// Native PASS is judged from the saved transcript against the assertions below.
export const cases=[
 {id:'E-R',skill:'bfs-router',request:'Advice only. For each independent request, name the narrowest BFS skill and mode without executing it: (1) prioritize a reported defect before investigation; (2) find the next useful action in current project context; (3) create an isolated learning exercise; (4) review an existing exercise; (5) implement a user-accepted specification; (6) diagnose a reproducible bug whose cause is unknown; (7) review observed lessons from a delivered change. Use the catalog and router instructions; do not create workflows, ask an interview or modify project/state files.'},
 {id:'E-T',skill:'bfs-triage',request:'Use report mode. Triage report.md against issue-18.md. State expected/actual, reproducibility, impact and priority with evidence. Is it a duplicate? Separate facts and hypotheses; give one next skill. Local report only; do not edit, fix or create an issue.',files:{'report.md':'Source: user report received 2026-10-01. Expected: export creates a file. Actual: repeated export refuses an occupied destination. Environment: Windows 11, Node 24. Reproduction: export twice to same path. Workaround: select another filename.\n','issue-18.md':'Issue #18: repeated export silently overwrites a user-created file. Reproduction: pre-create target, then export. Environment: Windows 11.\n'}},
 {id:'E-T-missing',skill:'bfs-triage',request:'Use report mode. Triage report.md. Expected behavior, actual output, environment and impact are absent. Ask only the missing fact that could most change priority or route. Do not invent cause or priority.',files:{'report.md':'Source: user message. “The import is broken.”\n'}},
 {id:'E-W',skill:'bfs-wayfinder',request:'Use guide mode. Read current project context and relevant workflow/history. A.md identifies the memory history key for completed A; inspect that history. Identify completed, stale and blocked work. Choose one useful next step tied to the still-open CSV import decision. State why and keep every project/state file unchanged.',files:{'A.md':'Completed work A. Memory history key: fact/work-A.\n','B.md':'Source changed after recorded success.\n','C.md':'Open decision: preserve legacy CSV import or remove it.\n','USER-NOTE.txt':'Keep unchanged.\n'}},
 {id:'E-L1',skill:'bfs-learn',request:'Create a runnable practice exercise under the new empty sibling directory ../practice-format-score. Goal: format a finite score to exactly one decimal place and reject non-finite values. Include task, minimal starter, executable check and short run instructions. The starter must fail the check. Use synthetic values; do not change existing project files.',files:{'USER-NOTE.txt':'Preserve unchanged.\n'}},
 {id:'E-L1-existing',skill:'bfs-learn',request:'Create a runnable practice exercise at the requested sibling path ../practice-format-score-existing. It already contains a user-owned marker.txt. Inspect the path, preserve its bytes and ask for another path; do not create or replace anything there.',files:{'USER-NOTE.txt':'Preserve unchanged.\n'}},
 {id:'E-L2',skill:'bfs-learn',mode:'review',request:'Use review mode. Inspect the real exercise under ../practice-format-score and the actual red/green evidence in ../learning-evidence.json. Run exactly `node check.mjs` from the exercise and review the learner solution. The user explicitly asks to save the observed lesson: check Number.isFinite before formatting. Save it in this isolated project using memory kind learning, source observed and sourceRef to the actual check/solution; read it back and report its ID. Do not mark product work complete or change global instructions.'}
];

function nativeCase(id, mode){const c=cases.find(row=>row.id===id);return {...c,...(mode?{mode}:{})};}
function treeHashes(folder){const rows={};if(!fs.existsSync(folder))return rows;function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Evidence tree contains a symlink');if(entry.isDirectory())visit(file);else rows[path.relative(folder,file).replaceAll('\\','/')]=digest(fs.readFileSync(file));}}visit(folder);return rows;}
function seedWayfinder(run, root){
 const env={...process.env,BFS_STATE_HOME:path.join(run.project,'.bfs-state'),CODEX_THREAD_ID:'fixture-seed'};
 const ctx=context(run.project,env),catalog=loadCatalog();
 memory(ctx,'put',{kind:'fact',key:'work-A',text:'A is complete.','source':'observed',sourceRef:'fixture A'});
 memory(ctx,'status',{kind:'fact',key:'work-A',expectedId:memory(ctx,'list',{kind:'fact',key:'work-A'})[0].id,status:'completed',reason:'Fixture completion'});
 memory(ctx,'put',{kind:'fact',key:'work-B',text:'B was green before B.md changed.','source':'observed',sourceRef:'fixture B.md',files:['B.md']});
 fs.writeFileSync(path.join(run.project,'B.md'),'B source changed after its evidence.\n');
 const blocked=workflow(ctx,'start',{goal:'Resolve legacy CSV import choice',skills:['bfs-spec']},catalog);
 workflow(ctx,'begin',{id:blocked.id,step:'1',inputs:['C.md']},catalog);
 workflow(ctx,'step',{id:blocked.id,step:'1',status:'blocked',summary:'Blocked on user decision whether to preserve legacy CSV import',decisions:['Preserve or remove legacy CSV import'],next:'bfs-spec'},catalog);
}
function prepareLearning(root){
 const project=path.join(root,'projects','E-L1-1'),exercise=path.join(root,'projects','practice-format-score');
 if(!fs.existsSync(path.join(exercise,'check.mjs')))throw Error('E-L1 did not create its runnable exercise');
 const first=JSON.parse(fs.readFileSync(path.join(root,'evidence','E-L1-1','result.json'),'utf8')).commands.find(row=>row.command.includes('node check.mjs')&&row.exit===1);
 if(!first)throw Error('E-L1 transcript does not contain an actual failing starter check');
 const starter=fs.readdirSync(exercise).filter(name=>name.endsWith('.mjs')&&name!=='check.mjs').find(name=>fs.readFileSync(path.join(exercise,name),'utf8').includes('formatScore'));
 if(!starter)throw Error('Could not identify the learner-owned formatScore starter');
 fs.writeFileSync(path.join(exercise,starter),'export function formatScore(score) { if (!Number.isFinite(score)) throw new RangeError("score must be finite"); return score.toFixed(1); }\n');
 const after=spawnSync(process.execPath,['check.mjs'],{cwd:exercise,encoding:'utf8',windowsHide:true});if(after.status!==0)throw Error(`The learner solution check failed: ${after.stderr}`);
 const evidence={exercise:'../practice-format-score',before:{status:first.exit,output:first.output,nativeCase:'E-L1-1'},after:{status:after.status,stdout:after.stdout,stderr:after.stderr},files:snapshot(exercise)};
 fs.writeFileSync(path.join(root,'projects','learning-evidence.json'),JSON.stringify(evidence,null,2));
 const manifestFile=path.join(root,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
 manifest.learningEvidence={path:'projects/learning-evidence.json',exercise:'projects/practice-format-score',before:evidence.before,after:evidence.after,files:evidence.files};
 fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));return manifest.learningEvidence;
}
export function create(root, plugin){
 createMethodologyFixtures(root,plugin,[...cases]);const manifestFile=path.join(root,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));manifest.timeoutMs=180000;manifest.runs.forEach(row=>{if(row.id.startsWith('E-L2-'))row.mode='review';});
 seedWayfinder(manifest.runs.find(row=>row.id==='E-W-1'),root);
 const occupied=path.join(root,'projects','practice-format-score-existing');fs.mkdirSync(occupied,{recursive:true});fs.writeFileSync(path.join(occupied,'marker.txt'),'user-owned bytes\n');
 const wayfinder=manifest.runs.find(row=>row.id==='E-W-1');wayfinder.before=snapshot(wayfinder.project);wayfinder.stateBefore=treeHashes(path.join(wayfinder.project,'.bfs-state'));
 manifest.existingTargetBefore=digest(fs.readFileSync(path.join(occupied,'marker.txt')));
 fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [action,root,arg,...selected]=process.argv.slice(2);
 if(action==='create'){const manifest=create(path.resolve(root),path.resolve(arg));console.log(JSON.stringify({root:path.resolve(root),cases:manifest.runs.map(row=>row.case)}));}
 else if(action==='prepare-learning')console.log(JSON.stringify(prepareLearning(path.resolve(root))));
 else if(action==='run'){
  const entry=path.resolve(arg);const runner=fileURLToPath(new URL('./methodology-acceptance.mjs',import.meta.url));
  const {spawnSync}=await import('node:child_process');const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  const ids=selected.length?selected:cases.map(row=>row.id);
  for(const id of ids){const result=spawnSync(process.execPath,[runner,'run',path.resolve(root),entry,id],{encoding:'utf8',stdio:'inherit',windowsHide:true});if(result.status!==0)process.exitCode=result.status||1;
   const manifestFile=path.join(root,'manifest.json'),fresh=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
   if(id==='E-W'){const run=fresh.runs.find(row=>row.id==='E-W-1'),resultFile=path.join(root,'evidence',run.id,'result.json'),saved=JSON.parse(fs.readFileSync(resultFile,'utf8'));saved.stateBefore=run.stateBefore;saved.stateAfter=treeHashes(path.join(run.project,'.bfs-state'));saved.stateUnchanged=JSON.stringify(saved.stateBefore)===JSON.stringify(saved.stateAfter);fs.writeFileSync(resultFile,JSON.stringify(saved,null,2));}
   if(id==='E-L1-existing'){const resultFile=path.join(root,'evidence','E-L1-existing-1','result.json'),saved=JSON.parse(fs.readFileSync(resultFile,'utf8'));saved.markerAfter=digest(fs.readFileSync(path.join(root,'projects','practice-format-score-existing','marker.txt')));saved.markerUnchanged=saved.markerAfter===fresh.existingTargetBefore;fs.writeFileSync(resultFile,JSON.stringify(saved,null,2));}
   if(id==='E-L1'){const learning=prepareLearning(root);const resultFile=path.join(root,'evidence','E-L1-1','result.json'),saved=JSON.parse(fs.readFileSync(resultFile,'utf8'));saved.learningEvidence=learning;fs.writeFileSync(resultFile,JSON.stringify(saved,null,2));}
  }
 }
 else throw Error('Use create <new-root> <plugin>, run <root> <codex-js-entry> [E-case IDs], or prepare-learning <root>');
}
