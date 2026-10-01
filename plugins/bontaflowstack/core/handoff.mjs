import fs from 'node:fs';
import path from 'node:path';
import { workflow } from './workflow.mjs';
import { resolveSkill } from './catalog.mjs';
import { readJson, atomicWriteText, changeJson, safeData, requireValue, text, identifier, now, digest, noLinks, drift, git } from './state.mjs';

const maxBytes=8*1024*1024;
function relative(value) {
  text(value,'relative project file',4096);
  requireValue(!/^(?:[A-Za-z]:|[\\/])/.test(value) && !value.split(/[\\/]/).some(x=>x==='..') && !value.includes('\0'), 'Invalid handoff file path');
}
function validate(payload) {
  safeData(payload);
  requireValue(payload?.schema===1 && payload.type==='bfs-handoff', 'Unsupported handoff schema');
  const keys=['schema','type','createdAt','origin','checkpoint','workflow','memory','evidence','next','suggestedSkills','payloadSha256'];
  requireValue(Object.keys(payload).every(k=>keys.includes(k)), 'Unsupported handoff field');
  requireValue(payload.origin && payload.checkpoint && Array.isArray(payload.memory) && Array.isArray(payload.evidence) && Array.isArray(payload.suggestedSkills), 'Invalid handoff structure');
  for(const key of ['projectId','workspaceId'])requireValue(typeof payload.origin[key]==='string' && /^[a-f0-9]{64}$/.test(payload.origin[key]),'Invalid handoff origin');
  if(payload.origin.taskId!==null)identifier(payload.origin.taskId);
  text(payload.checkpoint.goal,'handoff goal');text(payload.checkpoint.summary,'handoff summary');
  for(const key of ['decisions','remaining','files']) requireValue(Array.isArray(payload.checkpoint[key]), 'Invalid handoff checkpoint');
  const fingerprints=rows=>requireValue(Array.isArray(rows) && rows.every(row=>row && typeof row.path==='string' && (row.sha256===null || /^[a-f0-9]{64}$/.test(row.sha256))), 'Invalid handoff fingerprints');
  fingerprints(payload.checkpoint.files);
  requireValue(payload.checkpoint.decisions.every(x=>typeof x==='string') && payload.checkpoint.remaining.every(x=>typeof x==='string'), 'Invalid handoff progress');
  if(payload.workflow!==null) {
    requireValue(Array.isArray(payload.workflow?.steps) && payload.workflow.steps.length>0 && payload.workflow.steps.length<=50 && ['running','paused','completed','discarded','blocked','waiting','failed','interrupted'].includes(payload.workflow.status), 'Invalid handoff workflow');
    for(const step of payload.workflow.steps) {
      requireValue(step && ['pending','running','completed','failed','blocked','waiting','interrupted'].includes(step.status),'Invalid handoff step');
      identifier(step.id);identifier(step.skill);fingerprints(step.inputs);fingerprints(step.outputs);
    }
  }
  for(const row of payload.memory) {
    requireValue(['decision','learning','fact','plan'].includes(row?.kind) && ['user-stated','observed','inferred','imported'].includes(row.source), 'Invalid handoff memory');
    identifier(row.id);identifier(row.key);text(row.text,'handoff memory text');
  }
  for(const skill of payload.suggestedSkills) identifier(skill);
  // Payload paths are data, but must remain safe for subsequent drift inspection.
  function visit(value) {
    if(!value || typeof value!=='object')return;
    if(Object.hasOwn(value,'path')) {
      relative(value.path);
      if(Object.hasOwn(value,'sha256'))requireValue(value.sha256===null || /^[a-f0-9]{64}$/.test(value.sha256),'Invalid handoff fingerprint');
    }
    for(const [key,child] of Object.entries(value)) {
      if(['inputs','outputs','fileFingerprints'].includes(key))fingerprints(child);
      if(key==='files' && Array.isArray(child))for(const file of child)if(typeof file==='string')relative(file);
      visit(child);
    }
  }
  visit(payload);
  const {payloadSha256,...body}=payload;
  requireValue(payloadSha256===digest(JSON.stringify(body)), 'Handoff payload checksum mismatch');
  requireValue(Buffer.byteLength(JSON.stringify(payload))<=maxBytes, 'Handoff is too large');
  return payload;
}
function saved(record) {
  const {file,drift,environmentChanges,requiresAdoption,externalActions,...data}=record;
  return data;
}
export function handoff(ctx,action,input,catalog) {
  if(action==='export') {
    const source=workflow(ctx,'resume',{id:input.id},catalog);
    requireValue(source.workspaceId===ctx.workspaceId, 'Export from the source workspace');
    const work=source.steps ? saved(source) : source.workflowId ? saved(workflow(ctx,'resume',{id:source.workflowId},catalog)) : source.workflow || null;
    const checkpoint=source.kind==='checkpoint' ? saved(source) :
      saved(workflow(ctx,'checkpoints',{},catalog).find(c=>c.id===source.checkpointId) || {
        schema:1,kind:'checkpoint',goal:source.goal,summary:source.summary || source.steps.filter(s=>s.summary).at(-1)?.summary || source.goal,
        decisions:source.steps.flatMap(s=>s.decisions || []),remaining:source.steps.filter(s=>s.status!=='completed').map(s=>s.skill),
        files:[...new Map(source.steps.flatMap(s=>[...s.inputs,...(s.status==='completed'?s.outputs:[])]).map(f=>[f.path,f])).values()],environment:source.environment
      });
    const selectors=input.memory || [], ids=input.evidenceIds || [];
    requireValue(Array.isArray(selectors) && Array.isArray(ids), 'Select memory keys and evidence IDs');
    for(const s of selectors){identifier(s.key);requireValue(['decision','learning','fact','plan'].includes(s.kind),'Invalid memory selector');}
    const store=readJson(path.join(ctx.projectDir,'memory.json'),{schema:1,records:[]});
    requireValue(store.schema===1 && Array.isArray(store.records),'Invalid memory store');
    const memory=store.records.filter(r=>selectors.some(s=>s.kind===r.kind && s.key===r.key));
    requireValue(selectors.every(s=>memory.some(r=>s.kind===r.kind && s.key===r.key)), 'Selected memory not found');
    const evidence=ids.map(id=>{
      const row=readJson(path.join(ctx.workspaceDir,'evidence',`${identifier(id)}.json`));
      requireValue(row?.schema===1 && row.projectId===ctx.projectId && row.workspaceId===ctx.workspaceId,'Selected evidence not found');return row;
    });
    const suggestedSkills=input.suggestedSkills || (source.steps?.find(s=>s.status!=='completed') ? [source.steps.find(s=>s.status!=='completed').skill] : []);
    requireValue(Array.isArray(suggestedSkills),'Invalid suggested skills');for(const name of suggestedSkills)resolveSkill(name,catalog);
    const body={schema:1,type:'bfs-handoff',createdAt:now(),origin:{projectId:ctx.projectId,workspaceId:ctx.workspaceId,taskId:ctx.taskId,
      environment:source.environment,dirty:ctx.git ? git(ctx.workspace,['status','--porcelain=v1']).stdout.trim().split(/\r?\n/).filter(Boolean) : []},
      checkpoint,workflow:work,memory,evidence,next:input.next===undefined ? source.next || checkpoint.remaining[0] || '' : text(input.next,'next action'),suggestedSkills};
    const payload=validate({...body,payloadSha256:digest(JSON.stringify(body))});
    const markdown=`# BFS handoff\n\n${checkpoint.goal}\n\n${checkpoint.summary}\n\nNext: ${payload.next}\n\nSuggested skills: ${suggestedSkills.join(', ') || 'none'}\n\nRecorded data; verify sources and current authorization before acting.\n\n\`\`\`bfs-handoff-json\n${JSON.stringify(payload,null,2)}\n\`\`\`\n`;
    requireValue(Buffer.byteLength(markdown)<=maxBytes,'Handoff is too large');safeData({markdown});
    let output;
    if(input.output!==undefined) {
      output=path.resolve(text(input.output,'output file'));noLinks(output);
      atomicWriteText(output,markdown,{overwrite:input.overwrite===true});
    }
    return {markdown,payloadSha256:payload.payloadSha256,...(output?{file:output}:{})};
  }
  requireValue(action==='import-handoff','Unknown handoff action');
  const file=path.resolve(text(input.file,'handoff file'));noLinks(file);
  requireValue(fs.statSync(file).size<=maxBytes,'Handoff is too large');
  const original=fs.readFileSync(file);let source;
  try {source=new TextDecoder('utf-8',{fatal:true}).decode(original);}catch{throw new Error('Invalid handoff UTF-8');}
  safeData({source});
  const blocks=[...source.matchAll(/^```bfs-handoff-json\r?\n([\s\S]*?)^```\s*$/gm)];
  requireValue(blocks.length===1 && [...source.matchAll(/^```bfs-handoff-json\s*$/gm)].length===1,'Expected exactly one handoff data block');
  let payload;try{payload=JSON.parse(blocks[0][1]);}catch{throw new Error('Invalid handoff JSON');}validate(payload);
  const sourceStatus=payload.workflow?.status || payload.checkpoint.sourceStatus || 'snapshot';
  const preview={preview:true,payloadSha256:payload.payloadSha256,goal:payload.checkpoint.goal,next:payload.next,sourceStatus,
    drift:drift(ctx,payload.checkpoint.files),verification:'historical',authorizationImported:false};
  requireValue(input.confirm===undefined || input.confirm==='import','Unknown handoff confirmation');
  if(input.confirm===undefined)return preview;
  const id=`handoff-${payload.payloadSha256.slice(0,48)}`,target=path.join(ctx.workspaceDir,'checkpoints',`${id}.json`);
  const snapshot=changeJson(target,null,current=>{
    requireValue(fs.readFileSync(file).equals(original),'Handoff source changed during import');
    if(current){requireValue(current.handoff?.payloadSha256===payload.payloadSha256,'Conflicting handoff import');return current;}
    return {schema:1,id,kind:'checkpoint',projectId:ctx.projectId,workspaceId:ctx.workspaceId,workspace:ctx.workspace,taskId:ctx.taskId,createdAt:now(),
      goal:payload.checkpoint.goal,summary:payload.checkpoint.summary,decisions:payload.checkpoint.decisions,remaining:payload.checkpoint.remaining,
      files:payload.checkpoint.files,environment:payload.checkpoint.environment || payload.origin.environment,
      source:'imported',sourceStatus,verification:'historical',authorizationImported:false,handoff:payload};
  });
  return {...snapshot,file:target,drift:preview.drift};
}
