import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createMethodologyFixtures} from './methodology-acceptance.mjs';

// Native skill execution runs with real Codex task IDs and isolated workspaces.
// The probes remain local fixture artifacts; these cases request no publication.
export const cases=[
  {
    id:'P01',skill:'bfs-prototype',
    request:'Run a disposable experiment from experiment.md. It asks whether a rigid intake checklist adds steps with no effect compared with a goal-directed route for this fully scoped local maintenance request. Build the smallest executable comparison in a clearly marked PROTOTYPE folder, run it, and report both outcomes, actual command/exit/output, and limits. Preserve all other files. No production edits, decisions or publication.',
    files:{'experiment.md':`Question: For a request whose goal, scope and acceptance check are already explicit, does a fixed discovery script ask for information that cannot change the next useful action?

Hypothesis: A goal-directed route reaches the same accepted local check while asking zero irrelevant questions. A fixed script asks at least two: audience and visual design, which the supplied request excludes.

Fixture request: "Run the existing node test.mjs for the accepted greeting CLI. The user already specified the file, expected output and local test command. Preserve all files. No audience, pricing, visual design, external issue or publication work is in scope. Report the command result."

Compare these two policies with the same supplied facts: (A) fixed script asks audience, pricing and visual direction before checking; (B) goal-directed route reads the supplied request and executes node test.mjs. Count questions with no effect on the next requested action and whether each reaches the test result. This fixture tests only routing logic; it does not measure human satisfaction.
`}
  },
  {
    id:'P02',skill:'bfs-prototype',
    request:'A stakeholder says only "make the workflow feel better" and asks for a prototype. Inspect the supplied input. Decide if it supports a falsifiable experiment; if not, state the exact missing decision/observable criterion and leave project files unchanged. Do not invent a product direction, create a generic polished mockup, or claim an inconclusive idea is validated.',
    files:{'experiment.md':'Request: Make the workflow feel better. No user group, journey, observed friction, alternative, or success observation is specified.\n'}
  }
];

export function createPrototypeFixtures(root,plugin){
  const created=createMethodologyFixtures(root,plugin,cases);
  const manifestFile=path.join(root,'manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  manifest.timeoutMs=180000;
  fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));
  return {...created,cases:cases.map(({id})=>id),timeoutMs:manifest.timeoutMs};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [root,plugin]=process.argv.slice(2);
  if(!root||!plugin||!path.isAbsolute(root))throw Error('Use <new absolute evidence root> <plugin directory>');
  console.log(JSON.stringify(createPrototypeFixtures(root,path.resolve(plugin))));
}
