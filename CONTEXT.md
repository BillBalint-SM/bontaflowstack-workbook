# BontaFlowStack domain

BontaFlowStack is a Windows x64 Codex plugin for business and product development,
design, implementation, testing, documentation and delivery.

## Terms

- **Skill:** one of 28 public task entry points, defined by the catalog and its SKILL.md.
- **Mode:** an explicitly selected behavior within one skill, such as QA inspection or repair.
- **Workflow:** an ordered sequence of skills performed in the current chat.
- **Step:** one skill operation with input fingerprints, evidence, outputs and next action.
- **Checkpoint:** automatically saved step state or an additional manual context snapshot.
- **Project memory:** explicit typed decisions and learnings shared within a project.
- **Engine:** a separately installed browser, renderer or design capability invoked as a process.
- **Guard:** optional per-task command warnings and supported edit-path constraints.
- **Delivery evidence:** an observed result bound to the actual checked content.

## Decisions

The main package contains a Node.js standard-library core, a PowerShell launcher,
28 independently usable skills and two native hooks: PreToolUse and Stop.
Shared references and catalog entries define handoffs without dependencies on
another skill's internal directory. Optional engines are installed separately
from a checksum-pinned release. Legacy user data remains untouched; import is explicit.

The engine package implements browser sessions, rendering and local image comparison
with Node.js and separately installed dependencies. Image generation/editing uses
the current Codex image tool. Google DESIGN.md and impeccable are optional external
prerequisites for their specific operations; neither is required for ordinary design.

Skill names and modes are in `plugins/bontaflowstack/catalog.json`. The core
contract is `plugins/bontaflowstack/HOST.md`. Source and behavior checks run with
`node scripts/check.mjs`; actual browser integration has a separate explicit test.
