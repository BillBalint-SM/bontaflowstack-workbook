import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, requireValue, text } from './state.mjs';

export const pluginRoot = fileURLToPath(new URL('../',import.meta.url));
export function loadCatalog() {
  const catalog = readJson(path.join(pluginRoot,'catalog.json'));
  requireValue(catalog?.schema === 1 && Array.isArray(catalog.skills), 'Invalid skill catalog');
  return catalog;
}

export function selection(skill, input = {}, requireBasis = false) {
  let mode = input.mode ?? skill.defaultMode;
  if (skill.id !== 'bfs-qa') {
    requireValue(input.coverage === undefined && input.baseline === undefined && input.diffBase === undefined, 'QA coverage and bases are only supported by bfs-qa');
    requireValue(Object.hasOwn(skill.modes,mode), `Unknown mode for ${skill.id}: ${mode}`);
    return {mode};
  }
  let coverage = input.coverage;
  if (skill.coverages.includes(mode)) {
    requireValue(coverage === undefined || coverage === mode, 'Conflicting legacy QA mode and coverage');
    coverage = mode; mode = 'inspect';
  }
  if (coverage === undefined) coverage = skill.defaultCoverage;
  requireValue(Object.hasOwn(skill.modes,mode), `Unknown mode for ${skill.id}: ${mode}`);
  requireValue(skill.coverages.includes(coverage), `Unknown QA coverage: ${coverage}`);
  const result = {mode,coverage};
  for (const key of ['baseline','diffBase']) if (input[key] !== undefined) result[key] = text(input[key],key,4096);
  if (requireBasis && coverage === 'regression') text(input.baseline,'named regression baseline',4096);
  if (requireBasis && coverage === 'diff') text(input.diffBase,'diff comparison base',4096);
  return result;
}

export function resolveSkill(name, catalog = loadCatalog()) {
  name = String(name || '').replace(/^[$/]/,'').replace(/^bontaflowstack:/,'');
  const alias = catalog.aliases[name];
  const id = alias?.skill || name;
  const skill = catalog.skills.find(row => row.id === id);
  if (!skill) throw new Error(catalog.removed[name] ? `${name} was removed: ${catalog.removed[name]}` : `Unknown skill: ${name}`);
  return { ...skill, ...selection(skill,{mode:alias?.mode ?? skill.defaultMode}), ...(alias ? { previousName:name } : {}) };
}
