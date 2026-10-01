import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { git, requireValue, text, now, fingerprints, drift, atomicWrite, readJson, identifier, canonical, within, filesIn, safeData } from './state.mjs';
import { randomUUID } from 'node:crypto';

function checked(result, label) {
  if (result.error || result.status !== 0) {
    const error = new Error(`${label} failed: ${(result.stderr || result.error?.message || 'no diagnostic').trim()}`);
    error.exitCode = result.status || 1; throw error;
  }
  return result.stdout.trim();
}
function command(program, args, cwd, timeout = 30000) {
  return spawnSync(program, args, { cwd, encoding: 'utf8', windowsHide: true, timeout, maxBuffer: 8 * 1024 * 1024, shell: false });
}
const stages=['prepare','publish','integrate','deploy','verify'];
function subject(value) {
  requireValue(value && typeof value==='object' && !Array.isArray(value),'Provide the delivery subject');
  for(const field of ['target','sourceRevision'])text(value[field],field,4096);
  const fields=['target','sourceRevision','repository','provider','change','revision','version','artifactSha256'];
  requireValue(Object.keys(value).every(key=>fields.includes(key)),'Unknown subject field');
  for(const [key,item] of Object.entries(value))text(item,key,4096);
  if(value.artifactSha256)requireValue(/^[a-f0-9]{64}$/.test(value.artifactSha256),'Invalid artifact SHA-256');
  return safeData(value);
}
function observation(stdout) {
  try {
    const value=JSON.parse(stdout);
    if(!['completed','pending','unknown','not-applicable'].includes(value?.status) ||
      typeof value.target!=='string' || typeof value.provider!=='string' ||
      (value.status==='not-applicable' && !value.reason))return null;
    for(const key of ['target','provider'])text(value[key],key);
    for(const key of ['revision','version','artifactSha256','reference','reason'])if(value[key]!==undefined)text(value[key],key);
    if(value.artifactSha256 && !/^[a-f0-9]{64}$/.test(value.artifactSha256))return null;
    safeData(value);return value;
  }catch{return null;}
}
function result(ctx,record,expected) {
  const changed=drift(ctx,record.inputs),localValid=record.status==='completed' && !changed.length;
  let status=record.status==='completed' ? changed.length ? 'STALE' : 'COMPLETED' : 'FAILED';
  if(localValid && expected && Object.entries(expected).some(([key,value])=>record.subject?.[key]!==value))status='MISMATCH';
  const observed=record.observation;
  if(status==='COMPLETED' && record.stage!=='prepare') {
    if(!observed)status='UNKNOWN';
    else if(observed.status!=='completed')status=observed.status.toUpperCase();
    else if(!['revision','version','artifactSha256'].some(key=>record.subject?.[key]!==undefined))status='UNKNOWN';
    else if(['target','provider','revision','version','artifactSha256'].some(key=>record.subject?.[key]!==undefined && record.subject[key]!==observed[key]))status='MISMATCH';
  }
  return {id:record.id,status,localValid,drift:changed,subject:record.subject,observation:observed || null,createdAt:record.createdAt,liveVerified:false};
}
export function versionNext(current, bump) {
  requireValue(/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(current), 'Expected a three- or four-part version');
  const parts = current.split('.').map(Number);
  requireValue(parts.every(Number.isSafeInteger), 'Version component exceeds safe integer range');
  const index = { major:0, minor:1, patch:2, micro:3 }[bump];
  requireValue(index !== undefined && index < parts.length, 'Bump does not match the version format');
  parts[index]++;
  for (let i = index + 1; i < parts.length; i++) parts[i] = 0;
  return parts.join('.');
}
export function delivery(ctx, action, input = {}, baseline) {
  if (action === 'version') return { current: input.current, proposed: versionNext(text(input.current,'version'), input.bump || 'patch'), reserved: false };
  if (action === 'evidence') {
    requireValue(Array.isArray(input.command) && input.command.length && input.command.every(x => typeof x === 'string'), 'Provide a command argument array');
    const before = fingerprints(ctx, input.files || []);
    requireValue(before.length, 'Evidence needs the actual input files');
    requireValue(input.timeoutMs === undefined || (Number.isInteger(input.timeoutMs) && input.timeoutMs >= 100 && input.timeoutMs <= 600000), 'Timeout must be 100..600000 ms');
    text(input.label,'evidence label');
    if(input.stage!==undefined) {
      requireValue(stages.includes(input.stage),'Invalid delivery stage');identifier(input.workflowId);subject(input.subject);
      const work=readJson(path.join(ctx.workspaceDir,'workflows',`${input.workflowId}.json`));
      requireValue(work?.projectId===ctx.projectId && work.workspaceId===ctx.workspaceId && work.taskId===ctx.taskId,'Select an owned workflow');
    } else requireValue(input.workflowId===undefined && input.subject===undefined,'Select a stage for workflow delivery evidence');
    safeData(input);
    const result = command(input.command[0], input.command.slice(1), ctx.cwd, input.timeoutMs || 120000);
    const changed = drift(ctx, before);
    const record = { schema:1, id:randomUUID(), projectId:ctx.projectId, workspaceId:ctx.workspaceId, taskId:ctx.taskId,
      label:text(input.label,'evidence label'), command:input.command, inputs:baseline || before, createdAt:now(), exitCode:result.status ?? 1,
      status:result.status === 0 && !result.error && !changed.length ? 'completed' : 'failed', drift:changed,
      stdout:result.stdout || '', stderr:result.stderr || '', error:result.error?.message ?? null,
      ...(input.stage===undefined ? {} : {workflowId:input.workflowId,stage:input.stage,subject:input.subject,observation:observation(result.stdout || '')}) };
    const file = path.join(ctx.workspaceDir,'evidence',`${record.id}.json`);
    atomicWrite(file,record);
    return { ...record, file };
  }
  if (action === 'verify') {
    const record = readJson(path.join(ctx.workspaceDir,'evidence',`${identifier(input.id)}.json`));
    requireValue(record?.schema === 1 && record.projectId === ctx.projectId && record.workspaceId === ctx.workspaceId, 'Evidence not found in this workspace');
    const changed = drift(ctx,record.inputs);
    if(record.stage && record.stage!=='prepare') {
      if(input.command===undefined)return {...result(ctx,record,record.subject),valid:false,reason:'Supply an explicitly selected current status query; saved commands are not replayed.'};
      const probe=delivery(ctx,'evidence',{label:`Current verification: ${record.label}`,workflowId:record.workflowId,stage:'verify',subject:record.subject,
        files:record.inputs,command:input.command,timeoutMs:input.timeoutMs},record.inputs);
      const checked=result(ctx,probe,record.subject);
      return {...checked,id:record.id,probeId:probe.id,valid:checked.status==='COMPLETED',liveVerified:checked.status==='COMPLETED'};
    }
    return { id:record.id, valid:record.status === 'completed' && !changed.length, recordedStatus:record.status, drift:changed,liveVerified:false };
  }
  if(action==='report') {
    identifier(input.workflowId);subject(input.subject);
    const requested=input.stages || stages;requireValue(Array.isArray(requested) && requested.every(s=>stages.includes(s)),'Invalid requested stages');
    const rows=filesIn(path.join(ctx.workspaceDir,'evidence')).map(file=>readJson(file));
    requireValue(rows.every(r=>r?.schema===1 && r.projectId===ctx.projectId && r.workspaceId===ctx.workspaceId),'Invalid delivery evidence');
    const selected=rows.filter(row=>row.workflowId===input.workflowId && row.subject?.target===input.subject.target)
      .sort((a,b)=>b.createdAt.localeCompare(a.createdAt) || (b.status==='failed')-(a.status==='failed') || b.id.localeCompare(a.id));
    return {workflowId:input.workflowId,subject:input.subject,liveVerified:false,stages:Object.fromEntries(stages.map(stage=>{
      const row=selected.find(r=>r.stage===stage);
      return [stage,!requested.includes(stage) ? {status:'NOT-REQUESTED'} : row ? result(ctx,row,input.subject) : {status:'MISSING'}];
    }))};
  }
  requireValue(ctx.git, 'This delivery operation requires a Git repository');
  if (action === 'status') {
    const head = checked(git(ctx.workspace,['rev-parse','HEAD']),'Git HEAD');
    const branch = checked(git(ctx.workspace,['rev-parse','--abbrev-ref','HEAD']),'Git branch');
    const status = checked(git(ctx.workspace,['status','--porcelain=v1']),'Git status');
    const remote = input.remote ? checked(git(ctx.workspace,['remote','get-url',input.remote]),'Git remote') : null;
    return { head, branch, changes:status ? status.split(/\r?\n/) : [], remote, recordedAt:now() };
  }
  if (action === 'queue') {
    requireValue(['github','gitlab'].includes(input.host), 'Specify github or gitlab');
    requireValue(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_./-]+$/.test(input.repository || '') && !input.repository.includes('..'), 'Specify an exact repository');
    const result = input.host === 'github'
      ? command('gh',['pr','list','--repo',input.repository,'--state','open','--limit','100','--json','number,title,url,headRefOid,headRefName,baseRefName,statusCheckRollup'],ctx.cwd)
      : command('glab',['mr','list','--repo',input.repository,'--output','json','--per-page','100'],ctx.cwd);
    const rows = JSON.parse(checked(result,'Remote queue query'));
    requireValue(Array.isArray(rows), 'Remote queue response must be an array');
    return { host:input.host, repository:input.repository, fetchedAt:now(), entries:rows, complete:rows.length < 100,
      versionClaims:rows.flatMap(row => [...String(row.title || '').matchAll(/\bv?(\d+\.\d+\.\d+(?:\.\d+)?)\b/g)].map(m => ({ version:m[1], item:row.number ?? row.iid }))) };
  }
  if (action === 'config') {
    const file = canonical(path.resolve(ctx.workspace,input.file || '.bfstack/deploy.json'));
    requireValue(within(ctx.workspace,file), 'Deploy configuration must be inside the project');
    const config = readJson(file);
    requireValue(config?.environments && typeof config.environments === 'object', 'Supply existing deploy configuration with named environments');
    const selected = config.environments[text(input.environment,'environment')];
    requireValue(selected && typeof selected === 'object', 'Selected environment does not exist');
    for (const field of ['deploy','status','health']) if (selected[field] !== undefined) requireValue(Array.isArray(selected[field]) && selected[field].length && selected[field].every(x => typeof x === 'string'), `Invalid ${field} command`);
    return { file, environment:input.environment, configuration:selected, executionAuthorized:false };
  }
  throw new Error(`Unknown delivery action: ${action}`);
}
