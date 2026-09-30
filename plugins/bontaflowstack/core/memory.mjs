import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { atomicWrite, changeJson, readJson, safeData, requireValue, text, identifier, now, digest, noLinks, fingerprints } from './state.mjs';

const empty = () => ({ schema: 1, records: [] });
function valid(store) {
  requireValue(store?.schema === 1 && Array.isArray(store.records), 'Invalid memory store');
  return store;
}
function entry(input, ctx) {
  requireValue(['decision', 'learning', 'fact', 'plan'].includes(input.kind), 'Memory kind must be decision, learning, fact or plan');
  requireValue(['user-stated', 'observed', 'inferred', 'imported'].includes(input.source), 'Specify the actual memory source');
  requireValue(['active','completed','discarded'].includes(input.status ?? 'active'), 'Invalid memory status');
  if (input.confidence !== undefined) requireValue(Number.isFinite(input.confidence) && input.confidence >= 1 && input.confidence <= 10, 'Confidence must be 1..10');
  requireValue(Array.isArray(input.files ?? []), 'Memory files must be an array');
  const files = [...input.files || [], ...(input.document === undefined ? [] : [text(input.document,'document path',4096)])];
  const fileFingerprints = fingerprints(ctx,files);
  let details = input.details;
  if (input.document !== undefined) {
    requireValue(details === undefined, 'Use document or details, not both');
    const source = fileFingerprints.at(-1), bytes = fs.readFileSync(path.join(ctx.workspace,source.path));
    requireValue(digest(bytes) === source.sha256, 'Document changed while recording it');
    details = new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  }
  return safeData({ id: randomUUID(), key: identifier(input.key), kind: input.kind, type: input.type || 'operational',
    text: text(input.text, 'memory text'), rationale: input.rationale || '', source: input.source,
    confidence: input.confidence ?? null, files, fileFingerprints,
    status: input.status ?? 'active', sourceRef: input.sourceRef === undefined ? '' : text(input.sourceRef,'source reference',4096),
    ...(details === undefined ? {} : {details:text(details,'memory details',128000)}),
    ...(input.workflowId === undefined ? {} : {workflowId:identifier(input.workflowId)}), createdAt: now() });
}
function latest(store) {
  const byKey = new Map();
  for (const row of valid(store).records) byKey.set(`${row.kind}:${row.key}`, row);
  return [...byKey.values()];
}
export function memory(ctx, action, input = {}) {
  const file = path.join(ctx.projectDir, 'memory.json');
  if (action === 'put' || action === 'status') {
    let saved;
    changeJson(file, empty(), store => {
      valid(store);
      const previous = latest(store).find(row=>row.kind===input.kind && row.key===input.key);
      const target = action === 'status' ? store.records.find(row=>row.id===input.expectedId && row.kind===input.kind && row.key===input.key) : previous;
      if (action === 'status') {
        requireValue(target, 'Read the current revision before changing its status');
        requireValue(['active','completed','discarded'].includes(input.status), 'Invalid memory status');
        text(input.reason,'status reason');
      }
      const row = entry(action === 'status' ? {...target,status:input.status,confidence:target.confidence ?? undefined,sourceRef:target.sourceRef || undefined,files:[]} : input,ctx);
      if (action === 'status') { row.files=target.files || []; row.fileFingerprints=target.fileFingerprints || []; row.statusReason=input.reason; }
      if (target) row.supersedes = target.id;
      if (input.operationId) row.operationId = identifier(input.operationId);
      const duplicate = row.operationId && store.records.find(r => r.operationId === row.operationId);
      if (duplicate) {
        requireValue(['key','kind','type','text','source','rationale','confidence','details','workflowId','statusReason'].every(key => JSON.stringify(duplicate[key]) === JSON.stringify(row[key])) &&
          (duplicate.status ?? 'active') === row.status && (duplicate.sourceRef || '') === row.sourceRef &&
          JSON.stringify(duplicate.fileFingerprints || []) === JSON.stringify(row.fileFingerprints) &&
          (input.expectedId === undefined || duplicate.supersedes === input.expectedId),
          'Operation ID already belongs to different memory content');
        saved = duplicate;
      } else {
        if (input.expectedId !== undefined) requireValue(previous?.id === identifier(input.expectedId), 'Memory changed; read the current revision before updating');
        store.records.push(row); saved = row;
      }
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
      if (Array.isArray(data)) parsed = data;
      else if (data && Object.hasOwn(data,'records')) {
        requireValue(!Object.hasOwn(data,'decisions') && !Object.hasOwn(data,'learnings'), 'Ambiguous legacy format; use records or typed collections');
        parsed = data.records;
      } else if (data && ['decisions','learnings'].some(name => Object.hasOwn(data,name))) {
        parsed = [];
        for (const [name,kind] of [['decisions','decision'],['learnings','learning']]) {
          if (!Object.hasOwn(data,name)) continue;
          requireValue(Array.isArray(data[name]), `Invalid legacy collection: ${name}`);
          for (const row of data[name]) {
            requireValue(row && typeof row === 'object' && !Array.isArray(row), 'Invalid legacy record');
            parsed.push({ ...row, kind: row.kind ?? kind });
          }
        }
      }
    }
    requireValue(Array.isArray(parsed), 'Unsupported legacy format; export decisions or learnings as JSON/JSONL first');
    const sourceHash = digest(original);
    const rows = parsed.map((row, index) => {
      requireValue(row && typeof row === 'object' && !Array.isArray(row), `Invalid legacy record ${index + 1}`);
      const content = row.text || row.insight || row.decision;
      text(content, `legacy record ${index + 1}`);
      const result = entry({ key: `import-${sourceHash.slice(0,12)}-${index}`, kind: row.kind ?? (row.decision ? 'decision' : 'learning'),
        text: content, rationale: row.rationale || '', source: 'imported', type: row.type || 'operational' },ctx);
      return { ...result, originalSource: sourceHash, originalDate: row.createdAt || row.timestamp || null };
    });
    const conflicts = store => rows.flatMap(row => store.records.filter(old => old.key === row.key &&
      !['kind','text','rationale','type','source','originalSource','originalDate'].every(field => JSON.stringify(old[field]) === JSON.stringify(row[field])))
      .map(old => ({ id: old.id, key: old.key })));
    if (input.confirm !== 'import') return { preview: true, source, sourceHash, count: rows.length,
      counts: Object.fromEntries([...new Set(['decision','learning',...rows.map(row=>row.kind)])].map(kind => [kind,rows.filter(row => row.kind === kind).length])),
      conflicts: conflicts(valid(readJson(file,empty()))) };
    const saved = changeJson(file, empty(), store => {
      valid(store);
      const mismatches = conflicts(store);
      requireValue(!mismatches.length, `Legacy import conflicts with existing records: ${mismatches.map(row => row.id).join(', ')}; review them before importing`);
      requireValue(fs.readFileSync(source, 'utf8') === original, 'Legacy source changed during import');
      for (const row of rows) if (!store.records.some(old => old.key === row.key)) store.records.push(row);
      return store;
    });
    return { imported: saved.records.filter(row => row.originalSource === sourceHash).length, sourceHash, file };
  }
  const store = valid(readJson(file, empty()));
  const rows = (action === 'history' ? store.records : latest(store)).filter(row => (!input.kind || row.kind === input.kind) && (!input.key || row.key === input.key) && (!input.type || row.type === input.type)
    && (action === 'history' || input.includeInactive || (row.status ?? 'active') === 'active')
    && (!input.query || `${row.text} ${row.key} ${row.rationale}`.toLowerCase().includes(String(input.query).toLowerCase())));
  if (action === 'search' || action === 'list' || action === 'history') {
    requireValue(input.limit === undefined || (Number.isInteger(input.limit) && input.limit > 0 && input.limit <= 10000), 'Limit must be 1..10000');
    const result = rows.slice(-(input.limit ?? (action === 'history' ? 10000 : 50)));
    return action === 'history' ? result : result.reverse();
  }
  if (action === 'stats') {
    const counts = {};
    for (const row of rows) counts[row.kind] = (counts[row.kind] || 0) + 1;
    const confidence = rows.filter(row => Number.isFinite(row.confidence));
    return { records: store.records.length, current: rows.length, counts, averageConfidence: confidence.length ? confidence.reduce((sum,row) => sum + row.confidence, 0) / confidence.length : null };
  }
  if (action === 'export') return { markdown: ['# Project memory', ...rows.map(row => `\n## ${row.key}\n\n${row.text}\n\nKind: ${row.kind}; source: ${row.source}; status: ${row.status ?? 'active'}; recorded: ${row.createdAt}`+
    (row.sourceRef ? `\n\nSource reference: ${row.sourceRef}` : '')+(row.rationale ? `\n\nRationale: ${typeof row.rationale === 'string' ? row.rationale : JSON.stringify(row.rationale)}` : '')+
    (row.details ? `\n\n${row.details}` : ''))].join('\n') };
  throw new Error(`Unknown memory action: ${action}`);
}

const optionalQuestions = new Set(['plan-design-review-mode', 'plan-devex-review-mode', 'detail-preference', 'question-presentation']);
const questionPresentations = new Set(['prefer-panel', 'chat']);
const profileKeys = new Set(['scope_appetite', 'risk_tolerance', 'detail_preference', 'autonomy', 'architecture_care']);
const defaultPreferences = () => ({ schema: 1, enabled: false, values: {}, profile: {}, questions: [], proposals: [] });
function prefFile(ctx, scope) {
  requireValue(['user', 'project', 'task'].includes(scope), 'Preference scope must be user, project or task');
  if (scope === 'task') requireValue(ctx.taskId, 'Task preferences require a native task ID');
  return scope === 'user' ? path.join(ctx.home, 'preferences.json') : scope === 'project' ? path.join(ctx.projectDir, 'preferences.json') : path.join(ctx.workspaceDir, 'tasks', `${ctx.taskId}.preferences.json`);
}
function validPreferences(value) {
  requireValue(value?.schema === 1 && typeof value.enabled === 'boolean' && value.values && value.profile && Array.isArray(value.questions) && Array.isArray(value.proposals), 'Invalid preferences store');
  if (Object.hasOwn(value.values, 'question-presentation')) requireValue(questionPresentations.has(value.values['question-presentation']?.choice), 'Invalid question presentation choice');
  return value;
}
export function preferences(ctx, action, input = {}) {
  const scope = input.scope || (['set','reset'].includes(action) && input.id === 'question-presentation' ? 'user' : 'project');
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
      if (input.id === 'question-presentation') requireValue(input.options.length === 2 && input.options.every(option => questionPresentations.has(option)), 'Invalid question presentation options');
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
