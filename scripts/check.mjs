import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCatalog, pluginRoot } from '../plugins/bontaflowstack/core/cli.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const catalog=loadCatalog();
const manifest=JSON.parse(fs.readFileSync(path.join(pluginRoot,'.codex-plugin/plugin.json'),'utf8'));
assert.equal(manifest.version,catalog.version);
assert.equal(catalog.skills.length,28);
const names=catalog.skills.map(s=>s.id);
assert.equal(new Set(names).size,28);
assert.deepEqual(fs.readdirSync(path.join(pluginRoot,'skills')).sort(),[...names].sort());
for(const skill of catalog.skills) {
  assert.ok(Object.hasOwn(skill.modes,skill.defaultMode));
  for(const next of skill.handoffs)assert.ok(names.includes(next),`${skill.id}: unknown ${next}`);
  const folder=path.join(pluginRoot,'skills',skill.id);
  const source=fs.readFileSync(path.join(folder,'SKILL.md'),'utf8');
  assert.ok(source.startsWith(`---\nname: ${skill.id}\n`));
  for(const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    if(!/^https?:/.test(match[1]))assert.ok(fs.existsSync(path.resolve(folder,match[1])),`${skill.id}: broken ${match[1]}`);
  }
  const yaml=fs.readFileSync(path.join(folder,'agents/openai.yaml'),'utf8');
  assert.ok(yaml.includes(`$${skill.id}`));
}
for(const alias of Object.values(catalog.aliases))assert.ok(names.includes(alias.skill));
for(const route of Object.values(catalog.workflows))for(const name of route)assert.ok(names.includes(name));
const hooks=JSON.parse(fs.readFileSync(path.join(pluginRoot,'hooks/hooks.json'),'utf8'));
assert.deepEqual(Object.keys(hooks.hooks).sort(),['PreToolUse','Stop']);
assert.equal(fs.readFileSync(path.join(root,'LICENSE'),'utf8'),fs.readFileSync(path.join(pluginRoot,'LICENSE'),'utf8'));
const result=spawnSync(process.execPath,['--test',path.join(root,'tests/core.test.mjs')],{stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status||1);
console.log(`Checked BontaFlowStack ${manifest.version}: 28 skills, handoffs, hooks, license and core tests.`);
