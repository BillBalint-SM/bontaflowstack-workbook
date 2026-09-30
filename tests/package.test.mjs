import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../plugins/bontaflowstack/core/cli.mjs';
import { checkPublicSkills, skillPolicy, checkCatalog } from '../scripts/check.mjs';

const catalog=loadCatalog();
const readme=fs.readFileSync(fileURLToPath(new URL('../README.md',import.meta.url)),'utf8');
const policies=Object.fromEntries(catalog.skills.map(skill=>[skill.id,skill.id!=='bfs-guard']));

test('catalog rejects duplicate names, broken references and invalid QA settings',()=>{
  assert.doesNotThrow(()=>checkCatalog(catalog));
  for(const mutate of [c=>c.skills.push(c.skills[0]),c=>c.aliases.bad={skill:'missing'},c=>c.aliases.bad={skill:'bfs-qa',mode:'invalid'},c=>c.workflows.bad=['missing'],c=>c.skills.find(s=>s.id==='bfs-qa').defaultCoverage='invalid']) {
    const changed=structuredClone(catalog);mutate(changed);assert.throws(()=>checkCatalog(changed));
  }
});

test('public skill list and invocation routes agree',()=>{
  assert.doesNotThrow(()=>checkPublicSkills(catalog,readme,policies));
  for(const skills of ['','`bfs-router`, `bfs-router`','`unknown-skill`']) {
    const changed=readme.replace('| Routing | `bfs-router` |',`| Routing | ${skills} |`);
    assert.notEqual(changed,readme);
    assert.throws(()=>checkPublicSkills(catalog,changed,policies),/README skill table differs/);
  }
  assert.throws(()=>checkPublicSkills(catalog,readme,{...policies,'bfs-guard':true}),/bfs-guard: wrong invocation policy/);
  const wrongRoute=structuredClone(catalog);
  wrongRoute.skills[0].handoffs.push('bfs-guard');
  assert.throws(()=>checkPublicSkills(wrongRoute,readme,policies),/handoff to non-implicit bfs-guard/);
});

test('skill metadata requires UI fields and one invocation policy',()=>{
  const yaml=fs.readFileSync(fileURLToPath(new URL('../plugins/bontaflowstack/skills/bfs-guard/agents/openai.yaml',import.meta.url)),'utf8');
  assert.equal(skillPolicy('bfs-guard',yaml),false);
  assert.throws(()=>skillPolicy('bfs-guard',yaml.replace('  display_name:','  removed_name:')), /missing   display_name:/);
  assert.throws(()=>skillPolicy('bfs-guard',yaml.replace('allow_implicit_invocation: false','allow_implicit_invocation: maybe')), /expected one explicit invocation policy/);
});
