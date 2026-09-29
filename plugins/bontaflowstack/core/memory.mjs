import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { atomicWrite, changeJson, readJson, safeData, requireValue, text, identifier, now, digest, noLinks } from './state.mjs';

const empty = () => ({ schema: 1, records: [] });
function valid(store) {
  requireValue(store?.schema === 1 && Array.isArray(store.records), 'Invalid memory store');
  return store;
}
function entry(input) {
  requireValue(['decision', 'learning'].includes(input.kind), 'Memory kind must be decision or learning');
  requireValue(['user-stated', 'observed', 'inferred', 'imported'].includes(input.source), 'Specify the actual memory source');
  if (input.confidence !== undefined) requireValue(Number.isFinite(input.confidence) && input.confidence >= 1 && input.confidence <= 10, 'Confidence must be 1..10');
  return safeData({ id: randomUUID(), key: identifier(input.key), kind: input.kind, type: input.type || 'operational',
    text: text(input.text, 'memory text'), rationale: input.rationale || '', source: input.source,
    confidence: input.confidence ?? null, files: input.files || [], createdAt: now() });
}
function latest(store) {
  const byKey = new Map();
  for (const row of valid(store).records) byKey.set(`${row.kind}:${row.key}`, row);
  return [...byKey.values()];
}
export function memory(ctx, action, input = {}) {
  const file = path.join(ctx.projectDir, 'memory.json');
  if (action === 'put') {
    const row = entry(input);
    if (input.operationId) row.operationId = identifier(input.operationId);
    let saved = row;
    changeJson(file, empty(), store => {
      valid(store);
      const previous = row.operationId && store.records.find(r => r.operationId === row.operationId);
      if (previous) {
        requireValue(['key','kind','text','source','rationale'].every(key => previous[key] === row[key]), 'Operation ID already belongs to different memory content');
        saved = previous;
      } else store.records.push(row);
      return store;
    });
    return { ...saved, file };
  }
  if (action === 'prune') {
    requireValue(Array.isArray(input.ids) && input.ids.length > 0 && input.ids.every(id => typeof id === 'string'), 'Provide exact record IDs');
    return changeJson(file, empty(), store => {
      valid(store);
      requireValue(input.ids.every(id => store.records.some(row => row.id === id)), 'A selected record no longer exists');
      atomicWrite(`${file}.${randomUUID()}.backup.json`, store);
      store.records = store.records.filter(row => !input.ids.includes(row.id));
      return store;
    });
  }
  if (action === 'import-legacy') {
    const source = path.resolve(text(input.file, 'legacy file'));
    noLinks(source);
    const original = fs.readFileSync(source, 'utf8');
    requireValue(original.length <= 8 * 1024 * 1024, 'Legacy file is too large');
    let parsed;
    if (source.endsWith('.jsonl')) parsed = original.split(/\r?\n/).filter(x => x.trim()).map(line => JSON.parse(line));
    else {
      const data = JSON.parse(original.replace(/^\uFEFF/, ''));
      parsed = Array.isArray(data) ? data : data.records || data.decisions || data.learnings;
    }
    requireValue(Array.isArray(parsed), 'Unsupported legacy format; export decisions or learnings as JSON/JSONL first');
    const sourceHash = digest(original);
    const rows = parsed.map((row, index) => {
      const content = row.text || row.insight || row.decision;
      text(content, `legacy record ${index + 1}`);
      const result = entry({ key: `import-${sourceHash.slice(0,12)}-${index}`, kind: row.kind || (row.decision ? 'decision' : 'learning'),
        text: content, rationale: row.rationale || '', source: 'imported', type: row.type || 'operational' });
      return { ...result, originalSource: sourceHash, originalDate: row.createdAt || row.timestamp || null };
    });
    if (input.confirm !== 'import') return { preview: true, source, sourceHash, count: rows.length };
    const saved = changeJson(file, empty(), store => {
      valid(store);
      for (const row of rows) if (!store.records.some(old => old.key === row.key)) store.records.push(row);
      return store;
    });
    requireValue(fs.readFileSync(source, 'utf8') === original, 'Legacy source changed during import');
    return { imported: saved.records.filter(row => row.originalSource === sourceHash).length, sourceHash, file };
  }
  const store = valid(readJson(file, empty()));
  const rows = latest(store).filter(row => (!input.kind || row.kind === input.kind) && (!input.type || row.type === input.type)
    && (!input.query || `${row.text} ${row.key} ${row.rationale}`.toLowerCase().includes(String(input.query).toLowerCase())));
  if (action === 'search' || action === 'list') {
    requireValue(input.limit === undefined || (Number.isInteger(input.limit) && input.limit > 0 && input.limit <= 10000), 'Limit must be 1..10000');
    return rows.slice(-(input.limit ?? 50)).reverse();
  }
  if (action === 'stats') {
    const counts = {};
    for (const row of rows) counts[row.kind] = (counts[row.kind] || 0) + 1;
    const confidence = rows.filter(row => Number.isFinite(row.confidence));
    return { records: store.records.length, current: rows.length, counts, averageConfidence: confidence.length ? confidence.reduce((sum,row) => sum + row.confidence, 0) / confidence.length : null };
  }
  if (action === 'export') return { markdown: ['# Project memory', ...rows.map(row => `\n## ${row.key}\n\n${row.text}\n\nKind: ${row.kind}; source: ${row.source}; recorded: ${row.createdAt}`)].join('\n') };
  throw new Error(`Unknown memory action: ${action}`);
}

const optionalQuestions = new Set(['plan-design-review-mode', 'plan-devex-review-mode', 'detail-preference']);
const profileKeys = new Set(['scope_appetite', 'risk_tolerance', 'detail_preference', 'autonomy', 'architecture_care']);
const defaultPreferences = () => ({ schema: 1, enabled: false, values: {}, profile: {}, questions: [], proposals: [] });
function prefFile(ctx, scope) {
  requireValue(['user', 'project', 'task'].includes(scope), 'Preference scope must be user, project or task');
  if (scope === 'task') requireValue(ctx.taskId, 'Task preferences require a native task ID');
  return scope === 'user' ? path.join(ctx.home, 'preferences.json') : scope === 'project' ? path.join(ctx.projectDir, 'preferences.json') : path.join(ctx.workspaceDir, 'tasks', `${ctx.taskId}.preferences.json`);
}
function validPreferences(value) {
  requireValue(value?.schema === 1 && typeof value.enabled === 'boolean' && value.values && value.profile && Array.isArray(value.questions) && Array.isArray(value.proposals), 'Invalid preferences store');
  return value;
}
export function preferences(ctx, action, input = {}) {
  const scope = input.scope || 'project';
  const file = prefFile(ctx, scope);
  const current = validPreferences(readJson(file, defaultPreferences()));
  if (action === 'inspect') return { scope, advisory: true, ...current };
  if (action === 'effective') {
    const layers = ['user','project', ...(ctx.taskId ? ['task'] : [])].map(s => ({ scope: s, ...validPreferences(readJson(prefFile(ctx,s), defaultPreferences())) }));
    return { advisory: true, layers, values: Object.assign({}, ...layers.map(s => s.values)), profile: Object.assign({}, ...layers.map(s => s.profile)) };
  }
  if (action === 'stats') return { scope, questions: current.questions.length, proposals: current.proposals.length,
    pending: current.proposals.filter(p => p.status === 'pending').length, declared: current.profile,
    observedAnswers: current.questions.map(q => ({ id: q.id, answer: q.answer })), gap: 'Compare declared preferences with these observations; sample size is not a fact about the user.' };
  if (action === 'apply') {
    const proposal = current.proposals.find(p => p.id === input.id);
    requireValue(proposal?.status === 'pending' && input.confirm === 'apply', 'Select a pending proposal and confirm apply');
    if (proposal.kind === 'memory') memory(ctx, 'put', { ...proposal.value, source: 'user-stated', operationId: `proposal-${proposal.id}` });
    else preferences(ctx, proposal.kind === 'profile' ? 'profile' : 'set', { ...proposal.value, scope });
    return changeJson(file, defaultPreferences(), store => {
      validPreferences(store).proposals.find(p => p.id === input.id).status = 'applied';
      return store;
    });
  }
  return changeJson(file, defaultPreferences(), store => {
    validPreferences(store);
    if (action === 'set') {
      requireValue(optionalQuestions.has(input.id), 'Only optional presentation preferences can be stored here');
      requireValue(Array.isArray(input.options) && input.options.length >= 2 && new Set(input.options).size === input.options.length && input.options.includes(input.choice), 'Choice must match distinct supplied options');
      store.values[input.id] = { choice: input.choice, question: text(input.question, 'question'), options: input.options, source: 'user-stated', updatedAt: now() };
    } else if (action === 'reset') {
      requireValue(optionalQuestions.has(input.id), 'Unknown optional preference');
      delete store.values[input.id];
    } else if (action === 'profile') {
      requireValue(input.values && typeof input.values === 'object' && !Array.isArray(input.values), 'Provide profile values');
      for (const [key, value] of Object.entries(input.values)) {
        requireValue(profileKeys.has(key) && Number.isFinite(value) && value >= 0 && value <= 1, 'Invalid declared profile value');
        store.profile[key] = value;
      }
    } else if (action === 'enable') {
      requireValue(typeof input.enabled === 'boolean', 'enabled must be boolean'); store.enabled = input.enabled;
    } else if (action === 'question') {
      requireValue(scope === 'project' && store.enabled, 'Enable project tuning before recording optional questions');
      requireValue(optionalQuestions.has(input.id), 'Only eligible optional questions may be recorded');
      store.questions.push({ id: input.id, question: text(input.question, 'question'), answer: text(input.answer, 'answer'), source: 'user-stated', createdAt: now() });
    } else if (action === 'propose') {
      requireValue(['preference','profile','memory'].includes(input.kind), 'Invalid proposal kind');
      requireValue(input.value && typeof input.value === 'object', 'Proposal value required');
      store.proposals.push({ id: randomUUID(), kind: input.kind, value: input.value, source: text(input.source, 'source quotation'), status: 'pending', createdAt: now() });
    } else throw new Error(`Unknown preferences action: ${action}`);
    return store;
  });
}
