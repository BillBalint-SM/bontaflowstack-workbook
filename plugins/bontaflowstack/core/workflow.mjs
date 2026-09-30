import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { atomicWrite, changeJson, readJson, requireValue, text, identifier, now, fingerprints, drift, filesIn, noLinks, safeData, git, digest } from './state.mjs';
import { selection as selectSettings, resolveSkill } from './catalog.mjs';

const states = ['completed', 'failed', 'blocked', 'waiting'];
const location = (ctx, id) => path.join(ctx.workspaceDir, 'workflows', `${identifier(id)}.json`);
const environment = ctx => ({ nodeMajor: Number(process.versions.node.split('.')[0]), workspace: ctx.workspace,
  head: ctx.git ? git(ctx.workspace,['rev-parse','HEAD']).stdout?.trim() || null : null,
  branch: ctx.git ? git(ctx.workspace,['rev-parse','--abbrev-ref','HEAD']).stdout?.trim() || null : null });
function valid(ctx, record, catalog) {
  requireValue(record?.schema === 1 && record.projectId === ctx.projectId && Array.isArray(record.steps), 'Invalid or foreign workflow');
  if (catalog) for (const step of record.steps) {
    const skill = resolveSkill(step.skill,catalog);
    Object.assign(step,{skill:skill.id},selectSettings(skill,{...step,mode:step.mode ?? skill.mode}));
  }
  return record;
}
function owned(ctx, record, catalog) {
  valid(ctx, record, catalog);
  requireValue(record.workspaceId === ctx.workspaceId && record.taskId === ctx.taskId, 'Resume and explicitly adopt this workflow before changing it');
  return record;
}
function records(ctx, catalog) {
  const root = path.join(ctx.projectDir, 'workspaces');
  noLinks(root);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && /^[a-f0-9]{64}$/.test(e.name))
    .flatMap(e => filesIn(path.join(root, e.name, 'workflows'))).map(file => ({ file, record: valid(ctx, readJson(file), catalog) }));
}
// Later verified outputs supersede historical hashes of the same path.
function currentEvidence(steps) {
  const files = new Map();
  for (const step of steps) {
    for (const input of step.inputs) if (!files.has(input.path)) files.set(input.path,input);
    if (step.status === 'completed') for (const output of step.outputs) files.set(output.path,output);
  }
  return [...files.values()];
}
export function workflow(ctx, action, input, catalog) {
  if (action === 'start') {
    const route = input.route ? catalog.workflows[input.route] : undefined;
    requireValue(!input.route || route, 'Unknown workflow route');
    const selected = input.skills || route;
    requireValue(Array.isArray(selected) && selected.length > 0 && selected.length <= 50, 'Provide skills or a workflow route');
    const steps = selected.map((selection, i) => {
      const name = typeof selection === 'string' ? selection : selection?.skill;
      const skill = catalog.skills.find(s => s.id === name);
      requireValue(skill, `Unknown skill: ${name}`);
      const settings = typeof selection === 'string' ? {} : selection;
      return { id: String(i + 1), skill: name, ...selectSettings(skill,settings,true), status: 'pending', inputs: [], outputs: [], evidence: [] };
    });
    const record = { schema: 1, id: randomUUID(), projectId: ctx.projectId, workspaceId: ctx.workspaceId, workspace: ctx.workspace, taskId: ctx.taskId,
      goal: text(input.goal, 'goal'), environment: environment(ctx), route: input.route ?? null, status: 'running', createdAt: now(), updatedAt: now(), steps, next: input.next || steps[0].skill };
    atomicWrite(location(ctx, record.id), record);
    return record;
  }
  if (action === 'list') return records(ctx,catalog).map(({ record }) => ({ id: record.id, goal: record.goal, status: record.status, next: record.next, workspace: record.workspace,
    taskId:record.taskId, workspaceId:record.workspaceId, summary:record.steps.filter(step=>step.summary).at(-1)?.summary || '',
    decisions:record.steps.flatMap(step=>step.decisions || []), remaining:record.steps.filter(step=>step.status !== 'completed').map(step=>step.skill),
    checkpointId:record.checkpointId, updatedAt: record.updatedAt })).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  if (action === 'save') {
    if (input.workflowId !== undefined) owned(ctx,readJson(location(ctx,input.workflowId)),catalog);
    const snapshot = { schema: 1, id: randomUUID(), kind: 'checkpoint', projectId: ctx.projectId, workspaceId: ctx.workspaceId, workspace: ctx.workspace, taskId: ctx.taskId,
      createdAt: now(), environment: environment(ctx), goal: text(input.goal, 'goal'), summary: text(input.summary, 'summary'), decisions: input.decisions || [], remaining: input.remaining || [], files: fingerprints(ctx, input.files || []),
      ...(input.workflowId === undefined ? {} : {workflowId:identifier(input.workflowId)}), ...(input.workflow === undefined ? {} : {workflow:input.workflow}) };
    const file = path.join(ctx.workspaceDir, 'checkpoints', `${snapshot.id}.json`);
    atomicWrite(file, snapshot);
    return { ...snapshot, file };
  }
  if (action === 'checkpoints') {
    const root = path.join(ctx.projectDir, 'workspaces');
    noLinks(root);
    if (!fs.existsSync(root)) return [];
    return fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && /^[a-f0-9]{64}$/.test(e.name))
      .flatMap(e => filesIn(path.join(root, e.name, 'checkpoints'))).map(file => ({ ...readJson(file), file }));
  }
  if (action === 'resume') {
    const id = identifier(input.id);
    const record = records(ctx,catalog).find(x => x.record.id === id)?.record || workflow(ctx, 'checkpoints', {}, catalog).find(x => x.id === id);
    requireValue(record && record.projectId === ctx.projectId, 'Saved context not found in this project');
    const evidence = record.steps ? currentEvidence(record.steps) : record.files;
    const currentEnvironment = environment(ctx);
    const environmentChanges = Object.entries(record.environment || {}).filter(([key,value]) => currentEnvironment[key] !== value).map(([key,value]) => ({key,previous:value,current:currentEnvironment[key]}));
    return { ...record, drift: drift(ctx, evidence), environmentChanges, requiresAdoption: record.taskId !== ctx.taskId || record.workspaceId !== ctx.workspaceId,
      externalActions: 'Check actual remote state before retrying an uncertain operation; saved decisions do not authorize new actions.' };
  }
  if (action === 'import-legacy') {
    const file = path.resolve(text(input.file,'legacy context file')); noLinks(file);
    const original = fs.readFileSync(file,'utf8'); text(original,'legacy context',128000); safeData({summary:original});
    const sourceHash = digest(original);
    if (input.confirm !== 'import') return {preview:true,file,sourceHash,summary:original,authorizationImported:false};
    const existing = workflow(ctx,'checkpoints',{},catalog).find(row => row.legacySha256 === sourceHash);
    if (existing) return existing;
    const snapshot = { schema:1,id:randomUUID(),kind:'checkpoint',projectId:ctx.projectId,workspaceId:ctx.workspaceId,workspace:ctx.workspace,taskId:ctx.taskId,
      createdAt:now(),environment:environment(ctx),goal:text(input.goal,'goal'),summary:original,decisions:[],remaining:[],files:[],legacySha256:sourceHash,authorizationImported:false };
    requireValue(fs.readFileSync(file,'utf8') === original,'Legacy source changed during import');
    atomicWrite(path.join(ctx.workspaceDir,'checkpoints',`${snapshot.id}.json`),snapshot);
    return snapshot;
  }
  if (action === 'adopt') {
    const source = records(ctx,catalog).find(x => x.record.id === identifier(input.id));
    requireValue(source, 'Workflow not found');
    requireValue(source.record.workspaceId === ctx.workspaceId, 'Start a new workflow in this worktree using the restored summary');
    return changeJson(source.file, null, record => {
      valid(ctx, record, catalog);
      requireValue(input.confirm === 'resume', 'Explicit resume choice required');
      requireValue(record.status !== 'discarded', 'This workflow was discarded; start a new workflow for a new request');
      record.taskId = ctx.taskId;
      for (const step of record.steps) if (step.status === 'running') step.status = 'interrupted';
      if (record.status === 'paused') record.status = record.resumeStatus || 'running';
      record.updatedAt = now();
      return record;
    });
  }
  if (action === 'pause' || action === 'discard') {
    const file = location(ctx,input.id), prior = owned(ctx,readJson(file),catalog);
    requireValue(!['completed','discarded'].includes(prior.status), 'This workflow is already closed');
    const checkpoint = workflow(ctx,'save',{goal:prior.goal,summary:input.summary || prior.goal,
      decisions:input.decisions || prior.steps.flatMap(step=>step.decisions || []),
      remaining:input.remaining || prior.steps.filter(step=>step.status !== 'completed').map(step=>step.skill),
      files:input.files || currentEvidence(prior.steps),workflowId:prior.id,workflow:prior},catalog);
    return changeJson(file,null,record=>{
      owned(ctx,record,catalog);
      requireValue(record.updatedAt === prior.updatedAt, 'Workflow changed while saving; retry with the current state');
      if (record.status !== 'paused') record.resumeStatus = record.status;
      for (const step of record.steps) if (step.status === 'running') step.status = 'interrupted';
      record.status = action === 'pause' ? 'paused' : 'discarded';
      record.checkpointId = checkpoint.id; record.summary = checkpoint.summary; record.updatedAt = now();
      return record;
    });
  }
  if (action === 'begin' || action === 'step') {
    return changeJson(location(ctx, input.id), null, record => {
      owned(ctx, record, catalog);
      const step = record.steps.find(s => s.id === String(input.step));
      requireValue(step, 'Unknown step');
      if (action === 'begin') {
        requireValue(record.status !== 'discarded', 'This workflow was discarded; start a new workflow');
        requireValue(record.status !== 'paused', 'Resume and adopt the paused workflow before beginning a step');
        requireValue(!record.steps.some(s => s.status === 'running' && s.id !== step.id), 'Another step is still running');
        const previous = record.steps.slice(0, record.steps.indexOf(step));
        requireValue(previous.every(s => s.status === 'completed'), 'A preceding step is unresolved');
        requireValue(drift(ctx,currentEvidence(previous)).length === 0, 'Prior evidence is stale; recheck the affected step');
        for (const affected of record.steps.slice(record.steps.indexOf(step))) {
          if (affected.status !== 'pending') {
            const { history, ...prior } = affected;
            affected.history = [...history || [], prior];
          }
          affected.status = 'pending'; affected.inputs = []; affected.outputs = []; affected.evidence = [];
          delete affected.summary; delete affected.finishedAt; delete affected.decisions;
        }
        step.status = 'running'; step.inputs = fingerprints(ctx, input.inputs || []); step.startedAt = now();
        record.status = 'running'; record.next = step.skill;
      } else {
        requireValue(step.status === 'running', 'Begin the step before recording its result');
        requireValue(states.includes(input.status), 'Invalid step status');
        text(input.summary, 'summary');
        if (input.status === 'completed') {
          requireValue(Array.isArray(input.evidence) && input.evidence.length > 0 && input.evidence.every(e => typeof e === 'string' && e.trim()), 'Completion requires concrete verification evidence');
          requireValue(drift(ctx, step.inputs).length === 0, 'Inputs changed during this step; begin again with the actual reviewed inputs');
        }
        step.status = input.status; step.summary = input.summary; step.evidence = input.evidence || [];
        step.outputs = fingerprints(ctx, input.outputs || []); step.decisions = input.decisions || []; step.finishedAt = now();
        record.status = record.steps.every(s => s.status === 'completed') ? 'completed' : input.status === 'completed' ? 'running' : input.status;
        record.next = input.next || record.steps.find(s => s.status !== 'completed')?.skill || null;
      }
      record.updatedAt = now();
      return safeData(record);
    });
  }
  throw new Error(`Unknown workflow action: ${action}`);
}
export function stopWorkflows(ctx) {
  if (!ctx.taskId) return { changed: 0 };
  let changed = 0;
  for (const file of filesIn(path.join(ctx.workspaceDir, 'workflows'))) {
    const current = valid(ctx, readJson(file));
    if (current.taskId !== ctx.taskId || !current.steps.some(s => s.status === 'running')) continue;
    changeJson(file, null, record => {
      owned(ctx, record);
      for (const step of record.steps) if (step.status === 'running') step.status = 'interrupted';
      record.status = 'interrupted'; record.updatedAt = now(); return record;
    });
    changed++;
  }
  return { changed };
}
