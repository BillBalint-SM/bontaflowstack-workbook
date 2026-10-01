import fs from 'node:fs';
import path from 'node:path';
import { changeJson, readJson, requireValue, text, identifier, now, fingerprints, drift, git, digest, filesIn, noLinks, canonical } from './state.mjs';
import { workflow } from './workflow.mjs';

const storePath=(ctx,id)=>path.join(ctx.projectDir,'task-plans',`${identifier(id)}.json`);
const samePath=(a,b)=>{if(typeof a!=='string'||typeof b!=='string')return false;const left=canonical(a),right=canonical(b);return process.platform==='win32'?left.toLowerCase()===right.toLowerCase():left===right;};
const clean=(ctx)=>{const r=git(ctx.workspace,['status','--porcelain']);requireValue(r.status===0,'Cannot inspect worktree status');return r.stdout.trim()==='';};
const head=(ctx)=>{const r=git(ctx.workspace,['rev-parse','HEAD']);requireValue(r.status===0,'A Git commit is required');return r.stdout.trim();};
const gitFingerprints=(ctx,files,revision=head(ctx))=>files.map(file=>{const r=git(ctx.workspace,['rev-parse',`${revision}:${file}`]);return {path:file,oid:r.status===0?r.stdout.trim():null};});
const gitDrift=(ctx,entries,revision=head(ctx))=>entries.flatMap(entry=>{const current=gitFingerprints(ctx,[entry.path],revision)[0];return current.oid===entry.oid?[]:[{...entry,current:current.oid}];});
const gitWorktreeDrift=(ctx,entries,revision)=>entries.flatMap(entry=>{const r=git(ctx.workspace,['diff','--quiet',revision,'--',entry.path]);return r.status===0?[]:[{...entry,current:'worktree-diff'}];});
const paths=(value,label)=>{
  requireValue(Array.isArray(value)&&value.length>0&&value.length<=200,`Provide ${label}`);
  const normalized=value.map(v=>{
    text(v,`${label} path`,4096);const p=v.replaceAll('\\','/');
    requireValue(!/[\x00-\x1f\x7f]/.test(p),'Paths cannot contain control characters');
    requireValue(!p.startsWith('/')&&!/^[a-zA-Z]:/.test(p)&&!p.split('/').some(part=>!part||part==='.'||part==='..'),'Paths must be normalized and relative');
    requireValue(!p.split('/').includes('.git'),'Git metadata is outside the task scope');return p;
  });
  requireValue(new Set(normalized).size===normalized.length,`${label} contains duplicates`);return normalized;
};
function validatePlan(ctx,plan,{allowStaleBase=false}={}){
  requireValue(ctx.git,'Parallel tasks require a Git project');
  requireValue(plan?.schema===1,'Unsupported task plan schema');identifier(plan.planId);text(plan.goal,'plan goal');text(plan.acceptanceSource,'acceptance source');
  requireValue(Array.isArray(plan.tasks)&&plan.tasks.length>0&&plan.tasks.length<=100,'Task plan must contain 1–100 tasks');
  const ids=new Set();
  for(const task of plan.tasks){
    identifier(task.id);requireValue(!ids.has(task.id),`Duplicate task ID: ${task.id}`);ids.add(task.id);text(task.goal,'task goal');
    requireValue(Array.isArray(task.dependsOn)&&task.dependsOn.length<=100,`Invalid dependencies for ${task.id}`);
    requireValue(new Set(task.dependsOn).size===task.dependsOn.length&&!task.dependsOn.includes(task.id),`Invalid dependencies for ${task.id}`);
    task.writePaths=paths(task.writePaths,'write paths');
    if(task.inputs===undefined)task.inputs=[];
    requireValue(Array.isArray(task.inputs)&&task.inputs.length<=500,'Invalid task input paths');
    task.inputs=task.inputs.length?paths(task.inputs,'input paths'):[];
    for(const field of ['acceptance','verification'])requireValue(Array.isArray(task[field])&&task[field].length>0&&task[field].every(v=>typeof v==='string'&&v.trim()&&v.length<=2000),`Provide task ${field}`);
  }
  for(const task of plan.tasks)for(const dep of task.dependsOn)requireValue(ids.has(dep),`Unknown dependency ${dep} in ${task.id}`);
  const order=[],visiting=[],visited=new Set();
  const visit=id=>{const cycleStart=visiting.indexOf(id);requireValue(cycleStart<0,`Task dependency cycle: ${[...visiting.slice(cycleStart),id].join(' -> ')}`);if(visited.has(id))return;visiting.push(id);for(const dep of plan.tasks.find(t=>t.id===id).dependsOn)visit(dep);visiting.pop();visited.add(id);order.push(id);};
  for(const id of ids)visit(id);
  const ancestors=new Map([...ids].map(id=>[id,new Set()]));
  const collect=id=>{const set=ancestors.get(id);for(const dep of plan.tasks.find(t=>t.id===id).dependsOn)if(!set.has(dep)){set.add(dep);for(const ancestor of ancestors.get(dep))set.add(ancestor);}};
  for(const id of order)collect(id);
  const revision=head(ctx);requireValue(allowStaleBase||plan.baseRevision===undefined||plan.baseRevision===revision,'Plan baseRevision must match the current Git HEAD');
  return {schema:1,planId:plan.planId,goal:plan.goal,acceptanceSource:plan.acceptanceSource,projectId:ctx.projectId,coordinatorTaskId:ctx.taskId,coordinatorWorkspaceId:ctx.workspaceId,
    coordinatorWorkspace:ctx.workspace,baseRevision:revision,createdAt:now(),tasks:plan.tasks.map(t=>({...t,dependsOn:[...t.dependsOn],writePaths:[...t.writePaths],inputs:[...t.inputs]})),order};
}
function validateStored(ctx,plan,planId){
  requireValue(plan?.schema===1&&plan.projectId===ctx.projectId&&plan.planId===planId,'Task plan not found in this project');
  requireValue(typeof plan.coordinatorTaskId==='string'&&typeof plan.coordinatorWorkspaceId==='string'&&typeof plan.coordinatorWorkspace==='string'&&Array.isArray(plan.tasks)&&Array.isArray(plan.order),'Malformed stored task plan');
  const coordinator=canonical(plan.coordinatorWorkspace),common=git(coordinator,['rev-parse','--path-format=absolute','--git-common-dir']);
  requireValue(common.status===0,`Cannot inspect stored coordinator worktree: ${common.stderr?.trim()||'git common-dir lookup failed'}`);
  const commonAnchor=canonical(common.stdout.trim());
  requireValue(samePath(commonAnchor,ctx.anchor),`Stored coordinator worktree is outside this Git project (expected ${ctx.anchor}; found ${commonAnchor})`);
  const expectedWorkspaceId=digest(process.platform==='win32'?coordinator.toLowerCase():coordinator);
  requireValue(plan.coordinatorWorkspaceId===expectedWorkspaceId&&/^[a-f0-9]{40,64}$/.test(plan.baseRevision||''),'Malformed task plan provenance');
  const ids=new Set(plan.tasks.map(task=>task?.id));requireValue(ids.size===plan.tasks.length&&plan.tasks.every(task=>task&&typeof task.id==='string'&&Array.isArray(task.dependsOn)&&Array.isArray(task.writePaths)&&Array.isArray(task.inputs)),'Malformed stored task records');
  requireValue(plan.order.length===plan.tasks.length&&new Set(plan.order).size===plan.order.length&&plan.order.every(id=>ids.has(id)),'Malformed stored task order');
  for(const task of plan.tasks){
    requireValue(task.dependsOn.every(id=>ids.has(id)),'Stored task references an unknown dependency');
    if(task.binding)requireValue(typeof task.binding.workflowId==='string'&&typeof task.binding.ownerTaskId==='string'&&/^[a-f0-9]{64}$/.test(task.binding.workspaceId||'')&&Array.isArray(task.binding.fileInputs)&&Array.isArray(task.binding.serializationAfter),'Malformed stored task binding');
    if(task.result)requireValue(/^[a-f0-9]{40,64}$/.test(task.result.commit||'')&&Array.isArray(task.result.changedPaths)&&/^[a-f0-9]{64}$/.test(task.result.workspaceId||'')&&typeof task.result.evidenceId==='string'&&Array.isArray(task.result.serializationAfter)&&Array.isArray(task.result.rawInputs),'Malformed stored worker result');
    if(task.integration)requireValue(/^[a-f0-9]{40,64}$/.test(task.integration.head||'')&&typeof task.integration.evidenceId==='string'&&typeof task.integration.ownerTaskId==='string'&&/^[a-f0-9]{64}$/.test(task.integration.evidenceWorkspaceId||'')&&typeof task.integration.coordinatorWorkspace==='string'&&samePath(task.integration.coordinatorWorkspace,plan.coordinatorWorkspace)&&Array.isArray(task.integration.checkInputs),'Malformed stored integration');
  }
  const normalized=validatePlan(ctx,structuredClone(plan),{allowStaleBase:true});
  requireValue(JSON.stringify(normalized.order)===JSON.stringify(plan.order),'Stored task order does not match graph dependencies');
  return plan;
}
function load(ctx,planId){return validateStored(ctx,readJson(storePath(ctx,planId)),planId);}
const overlaps=(a,b)=>a.writePaths.some(x=>b.writePaths.some(y=>x===y||x.startsWith(`${y}/`)||y.startsWith(`${x}/`)));
function expectedBase(plan,task){
  const byId=new Map(plan.tasks.map(t=>[t.id,t]));
  const prior=[...task.dependsOn.map(id=>byId.get(id)).filter(Boolean),...plan.tasks.filter(t=>t.id!==task.id&&t.integration&&overlaps(t,task))];
  const latest=prior.filter(t=>t.integration).sort((a,b)=>a.integration.at.localeCompare(b.integration.at)).at(-1);
  return latest?currentIntegration(plan):plan.baseRevision;
}
function currentIntegration(plan){
  if(!plan.tasks.some(t=>t.integration?.head))return plan.baseRevision;
  const live=git(plan.coordinatorWorkspace,['rev-parse','HEAD']);return live.status===0?live.stdout.trim():plan.baseRevision;
}
function acceptedBaseCurrent(ctx,plan){
  const live=git(plan.coordinatorWorkspace,['rev-parse','HEAD']);
  return live.status===0&&git(plan.coordinatorWorkspace,['merge-base','--is-ancestor',plan.baseRevision,live.stdout.trim()]).status===0;
}
function supersededBySerialization(ctx,plan,task,file,liveHead){
  return plan.tasks.filter(other=>other.integration&&other.result?.serializationAfter?.includes(task.id)&&other.result.changedPaths.includes(file)&&other.integration.at>task.integration.at)
    .sort((a,b)=>b.integration.at.localeCompare(a.integration.at)).some(other=>git(plan.coordinatorWorkspace,['merge-base','--is-ancestor',other.result.commit,liveHead]).status===0&&
      git(plan.coordinatorWorkspace,['rev-parse',`${liveHead}:${file}`]).stdout.trim()===other.result.outputs.find(output=>output.path===file)?.oid);
}
function driftAllowingSerializedUpdates(ctx,plan,task,entries,liveHead,raw=false){
  const current={...ctx,workspace:plan.coordinatorWorkspace},changes=raw?drift(current,entries):gitDrift(current,entries,liveHead);
  return changes.filter(change=>!supersededBySerialization(ctx,plan,task,change.path,liveHead));
}
function checkedIntegrated(ctx,plan,task,cache=new Map()){
  if(cache.has(task.id))return cache.get(task.id);
  cache.set(task.id,false);
  const result=task.result,integration=task.integration;if(!result||!integration)return false;
  const coordinator=integration.coordinatorWorkspace;
  try{
    const rev=git(coordinator,['rev-parse','HEAD']);if(rev.status!==0)return false;
    const ancestry=git(coordinator,['merge-base','--is-ancestor',result.commit,rev.stdout.trim()]);if(ancestry.status!==0)return false;
    if(git(coordinator,['merge-base','--is-ancestor',plan.baseRevision,rev.stdout.trim()]).status!==0)return false;
    if(driftAllowingSerializedUpdates(ctx,plan,task,[...(result.inputs||[]),...(result.outputs||[])],rev.stdout.trim()).length||gitWorktreeDrift({...ctx,workspace:coordinator},[...(result.inputs||[]),...(result.outputs||[])],rev.stdout.trim()).length)return false;
    if(driftAllowingSerializedUpdates(ctx,plan,task,integration.checkInputs||[],rev.stdout.trim(),true).length)return false;
    if(!checkedResult(ctx,plan,task,{allowSerialized:true,liveHead:rev.stdout.trim()}))return false;
    const workerEvidenceFile=path.join(ctx.projectDir,'workspaces',result.workspaceId,'evidence',`${result.evidenceId}.json`),workerEvidence=readJson(workerEvidenceFile);
    const evidenceFile=path.join(ctx.projectDir,'workspaces',integration.evidenceWorkspaceId,'evidence',`${integration.evidenceId}.json`),evidence=readJson(evidenceFile);
    const valid=workerEvidence?.status==='completed'&&workerEvidence.exitCode===0&&workerEvidence.taskId===result.ownerTaskId&&digest(JSON.stringify(workerEvidence))===result.evidenceDigest&&
      evidence?.schema===1&&evidence.status==='completed'&&evidence.exitCode===0&&evidence.taskId===integration.ownerTaskId&&digest(JSON.stringify(evidence))===integration.evidenceDigest;
    if(valid&&task.dependsOn.every(id=>checkedIntegrated(ctx,plan,plan.tasks.find(t=>t.id===id),cache))){cache.set(task.id,true);return true;}return false;
  }catch{return false;}
}
function checkedResult(ctx,plan,task,{allowSerialized=false,liveHead}={}){
  const result=task.result;if(!result)return false;
  try{
    const coordinator=plan.coordinatorWorkspace,rev=git(coordinator,['rev-parse','HEAD']);if(rev.status!==0)return false;
    if(git(coordinator,['merge-base','--is-ancestor',result.baseRevision,result.commit]).status!==0||git(coordinator,['cat-file','-e',`${result.commit}^{commit}`]).status!==0)return false;
    const worker={...ctx,workspace:result.workspace};
    const currentHead=liveHead||rev.stdout.trim(),coordinatorCtx={...ctx,workspace:coordinator};
    const changed=drift(worker,result.rawInputs||[]).concat(allowSerialized?driftAllowingSerializedUpdates(ctx,plan,task,result.inputs||[],currentHead):gitDrift(coordinatorCtx,result.inputs||[],currentHead),gitWorktreeDrift(coordinatorCtx,result.inputs||[],currentHead));if(changed.length)return false;
    const evidence=readJson(path.join(ctx.projectDir,'workspaces',result.workspaceId,'evidence',`${result.evidenceId}.json`));
    return evidence?.schema===1&&evidence.status==='completed'&&evidence.exitCode===0&&evidence.taskId===result.ownerTaskId&&evidence.workflowId===result.workflowId&&evidence.subject?.sourceRevision===result.commit&&
      digest(JSON.stringify(evidence))===result.evidenceDigest&&task.writePaths.every(scope=>typeof scope==='string');
  }catch{return false;}
}
function evidenceRecord(ctx,id,workflowId,ownerTaskId,stage){
  const record=readJson(path.join(ctx.workspaceDir,'evidence',`${identifier(id)}.json`));
  requireValue(record?.schema===1&&record.projectId===ctx.projectId&&record.workspaceId===ctx.workspaceId&&record.taskId===ownerTaskId&&record.workflowId===workflowId&&record.stage===stage&&record.status==='completed'&&record.exitCode===0&&record.drift?.length===0,'Select completed, current delivery evidence owned by this workflow and native task');
  requireValue(drift(ctx,record.inputs).length===0,'Selected delivery evidence fingerprints are stale');return record;
}
function status(ctx,plan){
  const byId=new Map(plan.tasks.map(t=>[t.id,t])),baseCurrent=acceptedBaseCurrent(ctx,plan),integrated=new Map(),ordered=[],rows=[],readyById=new Map();
  for(const id of plan.order)integrated.set(id,byId.get(id).integration?checkedIntegrated(ctx,plan,byId.get(id),integrated):false);
  const eligible=new Map();
  for(const id of plan.order){const task=byId.get(id),proofStale=task.result&&!task.integration&&!checkedResult(ctx,plan,task);
    const deps=task.dependsOn.every(dep=>integrated.get(dep));eligible.set(id,!task.result&&!task.binding&&deps&&!proofStale&&baseCurrent);}
  for(const id of plan.order){const task=byId.get(id),stale=task.integration&&!integrated.get(id),proofStale=task.result&&!task.integration&&!checkedResult(ctx,plan,task);
    const dependencies=task.dependsOn.map(dep=>({id:dep,integrated:integrated.get(dep)}));
    const activeConflict=plan.tasks.find(other=>other.id!==id&&overlaps(task,other)&&(other.binding||(other.result&&!other.integration)));
    const earlierReady=ordered.find(other=>overlaps(task,other)&&readyById.get(other.id));
    const serialization=activeConflict||earlierReady,ready=eligible.get(id)&&!serialization;
    readyById.set(id,!!ready);
    const row={id,goal:task.goal,dependsOn:task.dependsOn,status:stale||proofStale?'stale':task.integration?'integrated':task.result?'recorded':task.binding?'bound':ready?'ready':'blocked',ready:!!ready,
      expectedBase:expectedBase(plan,task),dependencies,...(serialization?{serializedBehind:serialization.id}:{}),...(task.result?{commit:task.result.commit}:{}),...(task.binding?{workspace:task.binding.workspace,ownerTaskId:task.binding.ownerTaskId}:{}),...(!baseCurrent?{reason:'Coordinator HEAD no longer descends from the accepted plan base'}:stale||proofStale?{reason:'Recorded inputs, outputs, or delivery evidence are stale'}:serialization?{reason:'Overlapping write scope is serialized behind another task'}:{})};
    ordered.push(task);rows.push(row);
  }
  return {planId:plan.planId,goal:plan.goal,baseRevision:plan.baseRevision,integrationHead:currentIntegration(plan),tasks:rows};
}
function ownedTask(ctx,plan,task){requireValue(task.binding&&task.binding.ownerTaskId===ctx.taskId&&task.binding.workspaceId===ctx.workspaceId&&samePath(task.binding.workspace,ctx.workspace),'This task is bound to another native task or worktree');}
function workflowRecord(ctx,id,catalog){const value=workflow(ctx,'resume',{id},catalog);return value;}

export function tasks(ctx,action,input={},catalog){
  if(action==='validate'){
    const plan=validatePlan(ctx,structuredClone(input.plan));return {valid:true,planId:plan.planId,baseRevision:plan.baseRevision,acceptanceSource:plan.acceptanceSource,order:plan.order,taskCount:plan.tasks.length,authorizesActions:false};
  }
  if(action==='create'){
    requireValue(ctx.taskId,'Creating a task plan requires the current native task ID');const plan=validatePlan(ctx,structuredClone(input.plan));
    return changeJson(storePath(ctx,plan.planId),null,prior=>{requireValue(!prior,'Task plan already exists');return plan;});
  }
  if(action==='list'){
    const directory=path.join(ctx.projectDir,'task-plans');noLinks(directory);
    return filesIn(directory).map(file=>{
      const planId=path.basename(file,'.json'),plan=load(ctx,planId),view=status(ctx,plan);
      return {planId,goal:plan.goal,acceptanceSource:plan.acceptanceSource,createdAt:plan.createdAt,coordinatorTaskId:plan.coordinatorTaskId,
        taskCount:plan.tasks.length,completed:plan.tasks.filter(task=>task.integration&&view.tasks.find(row=>row.id===task.id)?.status==='integrated').length,
        status:plan.tasks.every(task=>task.integration&&view.tasks.find(row=>row.id===task.id)?.status==='integrated')?'completed':'active'};
    }).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  }
  const planId=identifier(input.planId);
  if(action==='adopt')return changeJson(storePath(ctx,planId),null,current=>{
    validateStored(ctx,current,planId);requireValue(input.confirm==='resume','Explicit resume choice required');
    if(input.taskId===undefined){
      requireValue(ctx.workspaceId===current.coordinatorWorkspaceId&&samePath(ctx.workspace,current.coordinatorWorkspace),'Coordinator adoption must use the recorded coordinator worktree');
      if(current.coordinatorTaskId!==ctx.taskId){current.coordinatorOwnerHistory=[...(current.coordinatorOwnerHistory||[]),{previous:current.coordinatorTaskId,current:ctx.taskId,adoptedAt:now()}];current.coordinatorTaskId=ctx.taskId;}
      return current;
    }
    const task=current.tasks.find(row=>row.id===identifier(input.taskId));requireValue(task?.binding&&!task.result,'Only an active, unrecorded task can be adopted');
    requireValue(ctx.workspaceId===task.binding.workspaceId&&samePath(ctx.workspace,task.binding.workspace),'Worker adoption must use the recorded task worktree');
    requireValue(input.workflowId===task.binding.workflowId,'Adopt the bound workflow before adopting its task');
    const selected=workflowRecord(ctx,input.workflowId,catalog);requireValue(selected.taskId===ctx.taskId&&selected.workspaceId===ctx.workspaceId&&selected.status==='running'&&selected.environment?.head===task.binding.baseRevision,'Adopt the bound workflow in this native task first');
    requireValue(head(ctx)===task.binding.baseRevision&&gitDrift(ctx,task.binding.inputs,task.binding.baseRevision).length===0&&drift(ctx,task.binding.fileInputs).length===0,'Task base or input evidence changed; start a fresh task instead');
    if(task.binding.ownerTaskId!==ctx.taskId){task.binding.ownerHistory=[...(task.binding.ownerHistory||[]),{previous:task.binding.ownerTaskId,current:ctx.taskId,adoptedAt:now()}];task.binding.ownerTaskId=ctx.taskId;}
    return current;
  });
  if(action==='status')return status(ctx,load(ctx,planId));
  if(action==='bind')return changeJson(storePath(ctx,planId),null,current=>{
    validateStored(ctx,current,planId);
    const task=current.tasks.find(t=>t.id===identifier(input.taskId));requireValue(task,'Unknown task');
    const view=status(ctx,current).tasks.find(t=>t.id===task.id);requireValue(view.ready,'Task is not ready; integrate all dependencies first');
    requireValue(ctx.projectId===current.projectId&&ctx.git&&ctx.workspaceId!==current.coordinatorWorkspaceId,'Bind from an isolated worktree in the same Git project');
    requireValue(clean(ctx),'Task worktree must be clean before binding');
    const actual=head(ctx),expected=view.expectedBase;requireValue(actual===expected,`Worktree HEAD must equal expected base ${expected}`);
    const selected=workflowRecord(ctx,input.workflowId,catalog);requireValue(selected.id===input.workflowId&&selected.taskId===ctx.taskId&&selected.workspaceId===ctx.workspaceId&&selected.status==='running','Bind requires this native task’s running workflow in this worktree');
    requireValue(selected.environment?.head===actual&&samePath(selected.environment?.workspace,ctx.workspace),'Workflow was not started at this worktree HEAD');
    for(const other of current.tasks)if(other.id!==task.id&&overlaps(task,other))requireValue(!other.binding&&!(other.result&&!other.integration),'An overlapping task is already bound or awaiting integration');
    const serializationAfter=current.tasks.filter(other=>other.id!==task.id&&overlaps(task,other)&&other.integration).map(other=>other.id);
    const inputs=gitFingerprints(ctx,task.inputs,actual),tracked=new Set(inputs.filter(entry=>entry.oid!==null).map(entry=>entry.path));
    task.binding={ownerTaskId:ctx.taskId,workspaceId:ctx.workspaceId,workspace:ctx.workspace,branch:git(ctx.workspace,['rev-parse','--abbrev-ref','HEAD']).stdout.trim(),workflowId:input.workflowId,baseRevision:actual,inputs,fileInputs:fingerprints(ctx,task.inputs).filter(entry=>!tracked.has(entry.path)),serializationAfter};
    task.boundAt=now();return current;
  });
  if(action==='record')return changeJson(storePath(ctx,planId),null,current=>{
    validateStored(ctx,current,planId);
    const task=current.tasks.find(t=>t.id===identifier(input.taskId));requireValue(task,'Unknown task');ownedTask(ctx,current,task);
    const selected=workflowRecord(ctx,task.binding.workflowId,catalog);requireValue(selected.taskId===task.binding.ownerTaskId&&selected.workspaceId===task.binding.workspaceId&&selected.status==='completed'&&selected.drift.length===0&&selected.environmentChanges.every(change=>change.key==='head'),'Record requires the bound owner’s completed workflow and current file evidence');
    requireValue(clean(ctx),'Worker worktree must be clean before recording a result');const commit=head(ctx);
    requireValue(commit!==task.binding.baseRevision,'Worker must provide a new actual Git commit');
    requireValue(git(ctx.workspace,['merge-base','--is-ancestor',task.binding.baseRevision,commit]).status===0,'Worker commit must descend from its bound base');
    const changed=git(ctx.workspace,['diff','--name-only','-z',`${task.binding.baseRevision}..${commit}`]);requireValue(changed.status===0,'Cannot inspect worker commit');
    const changedPaths=changed.stdout.split('\0').filter(Boolean).map(p=>p.replaceAll('\\','/'));
    requireValue(changedPaths.length>0&&changedPaths.every(p=>task.writePaths.some(scope=>p===scope||p.startsWith(`${scope}/`))),`Worker commit exceeds declared writePaths: ${changedPaths.filter(p=>!task.writePaths.some(scope=>p===scope||p.startsWith(`${scope}/`))).join(', ')}`);
    const stableInputs=task.binding.inputs.filter(entry=>!changedPaths.includes(entry.path));
    requireValue(gitDrift(ctx,stableInputs,commit).length===0&&gitWorktreeDrift(ctx,stableInputs,commit).length===0,'Worker inputs changed since bind; rebind against current evidence');
    requireValue(drift(ctx,task.binding.fileInputs).filter(entry=>!changedPaths.includes(entry.path)).length===0,'Worker input files changed since bind; rebind against current evidence');
    const evidence=evidenceRecord(ctx,input.evidenceId,task.binding.workflowId,ctx.taskId,'prepare');
    requireValue(evidence.subject?.sourceRevision===commit,'Worker delivery evidence must identify the actual commit');
    requireValue(changedPaths.every(file=>evidence.inputs.some(input=>input.path===file)),'Worker evidence must fingerprint every changed source path');
    task.result={ownerTaskId:ctx.taskId,workspaceId:ctx.workspaceId,workspace:ctx.workspace,workflowId:task.binding.workflowId,baseRevision:task.binding.baseRevision,commit,changedPaths,
      inputs:task.binding.inputs.filter(entry=>!changedPaths.includes(entry.path)),rawInputs:task.binding.fileInputs.filter(entry=>!changedPaths.includes(entry.path)),
      outputs:gitFingerprints(ctx,changedPaths,commit),serializationAfter:task.binding.serializationAfter,evidenceId:evidence.id,evidenceDigest:digest(JSON.stringify(evidence)),workflowDigest:digest(JSON.stringify(selected)),summary:text(input.summary,'worker summary'),recordedAt:now()};
    task.binding=null;return current;
  });
  if(action==='integrate')return changeJson(storePath(ctx,planId),null,current=>{
    validateStored(ctx,current,planId);
    requireValue(ctx.taskId===current.coordinatorTaskId&&ctx.workspaceId===current.coordinatorWorkspaceId&&samePath(ctx.workspace,current.coordinatorWorkspace),'Only the plan coordinator may record integration');
    const task=current.tasks.find(t=>t.id===identifier(input.taskId));requireValue(task?.result&&!task.integration,'Worker result is not awaiting integration');
    requireValue(status(ctx,current).tasks.find(t=>t.id===task.id).status==='recorded','Worker result is stale');
    requireValue(task.dependsOn.every(id=>checkedIntegrated(ctx,current,current.tasks.find(t=>t.id===id))),'All task dependencies must still have valid integration evidence');
    const live=head(ctx);requireValue(clean(ctx),'Integration worktree must be clean');
    const selected=workflowRecord(ctx,input.workflowId,catalog);requireValue(selected.taskId===ctx.taskId&&selected.workspaceId===ctx.workspaceId&&selected.status==='completed'&&selected.drift.length===0&&selected.environmentChanges.length===0,'Integration requires completed current coordinator verification');
    requireValue(selected.environment?.head===live,'Coordinator verification must start at the actual integration HEAD');
    requireValue(selected.steps?.length&&selected.steps.every(s=>s.status==='completed'&&s.evidence?.length),'Coordinator workflow must record evidence for every integration check');
    const ancestor=git(ctx.workspace,['merge-base','--is-ancestor',task.result.commit,live]);requireValue(ancestor.status===0,'Worker commit is not an ancestor of the integration HEAD');
    requireValue(git(ctx.workspace,['merge-base','--is-ancestor',task.result.baseRevision,task.result.commit]).status===0,'Worker commit does not descend from its recorded base');
    requireValue(gitDrift(ctx,task.result.inputs,live).length===0&&gitWorktreeDrift(ctx,task.result.inputs,live).length===0,'Worker input fingerprints changed before integration');
    requireValue(gitDrift(ctx,task.result.outputs,live).length===0,'Integrated output differs from the recorded worker commit');
    const evidence=evidenceRecord(ctx,input.evidenceId,input.workflowId,ctx.taskId,'integrate');
    requireValue(evidence.subject?.sourceRevision===live,'Integration evidence must identify the exact live Git HEAD');
    requireValue(task.result.changedPaths.every(file=>evidence.inputs.some(input=>input.path===file)),'Integration evidence must fingerprint the actual worker outputs');
    task.integration={head:live,workflowId:input.workflowId,ownerTaskId:ctx.taskId,workflowDigest:digest(JSON.stringify(selected)),evidenceId:evidence.id,evidenceWorkspaceId:ctx.workspaceId,evidenceDigest:digest(JSON.stringify(evidence)),checkInputs:evidence.inputs,
      coordinatorWorkspace:ctx.workspace,at:now()};return current;
  });
  throw new Error(`Unknown task graph action: ${action}`);
}
