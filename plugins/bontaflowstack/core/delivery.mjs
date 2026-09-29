import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { git, requireValue, text, now, fingerprints, drift, atomicWrite, readJson, identifier, canonical, within } from './state.mjs';
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
export function delivery(ctx, action, input = {}) {
  if (action === 'version') return { current: input.current, proposed: versionNext(text(input.current,'version'), input.bump || 'patch'), reserved: false };
  if (action === 'evidence') {
    requireValue(Array.isArray(input.command) && input.command.length && input.command.every(x => typeof x === 'string'), 'Provide a command argument array');
    const before = fingerprints(ctx, input.files || []);
    requireValue(before.length, 'Evidence needs the actual input files');
    requireValue(input.timeoutMs === undefined || (Number.isInteger(input.timeoutMs) && input.timeoutMs >= 100 && input.timeoutMs <= 600000), 'Timeout must be 100..600000 ms');
    const result = command(input.command[0], input.command.slice(1), ctx.cwd, input.timeoutMs || 120000);
    const changed = drift(ctx, before);
    const record = { schema:1, id:randomUUID(), projectId:ctx.projectId, workspaceId:ctx.workspaceId, taskId:ctx.taskId,
      label:text(input.label,'evidence label'), command:input.command, inputs:before, createdAt:now(), exitCode:result.status ?? 1,
      status:result.status === 0 && !result.error && !changed.length ? 'completed' : 'failed', drift:changed,
      stdout:result.stdout || '', stderr:result.stderr || '', error:result.error?.message ?? null };
    const file = path.join(ctx.workspaceDir,'evidence',`${record.id}.json`);
    atomicWrite(file,record);
    return { ...record, file };
  }
  if (action === 'verify') {
    const record = readJson(path.join(ctx.workspaceDir,'evidence',`${identifier(input.id)}.json`));
    requireValue(record?.schema === 1 && record.projectId === ctx.projectId && record.workspaceId === ctx.workspaceId, 'Evidence not found in this workspace');
    const changed = drift(ctx,record.inputs);
    return { id:record.id, valid:record.status === 'completed' && !changed.length, recordedStatus:record.status, drift:changed };
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
