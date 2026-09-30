# BontaFlowStack domain

BontaFlowStack is a Windows x64 Codex plugin for business and product development,
design, implementation, testing, documentation and delivery.

## Terms

- **Skill:** a public task entry point, defined by the catalog and its SKILL.md.
- **Mode:** an explicitly selected behavior within one skill, such as QA inspection or repair.
- **QA coverage:** the independent quick, full, regression or diff extent of a QA operation.
- **Workflow:** an ordered sequence of skills performed in the current chat.
- **Step:** one skill operation with input fingerprints, evidence, outputs and next action.
- **Checkpoint:** automatically saved step state or an additional manual context snapshot.
- **Project memory:** versioned decisions, facts, plans and learnings shared within a project, with source references and lifecycle status.
- **Essential context:** a bounded current view of project memory and resumable work; full stored content and history remain available by record ID.
- **Engine:** a separately installed browser, renderer or design capability invoked as a process.
- **Guard:** optional per-task command warnings and supported edit-path constraints.
- **Delivery evidence:** an observed result bound to the actual checked content.
- **Accepted basis:** the concrete plan, specification, selected design or scoped change explicitly accepted by the user, with identifiable content and acceptance criteria.

## Decisions

The main package contains a Node.js standard-library core, a PowerShell launcher,
independently usable skills and two native hooks: PreToolUse and Stop.
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

General implementation uses the independent `bfs-implement` skill. It starts
from an accepted basis within a requested implementation scope and checkpoints
the actual decision and verified progress. Its skill instructions define when
to wait or return for acceptance of a material revision.

The accepted core-skill methodology keeps the existing BFS flow. Shared discovery
and planning references guide material decisions, domain collisions and verifiable
task dependencies. `bfs-implement` owns TDD; bug investigation supplies its verified
reproduction. Code review reports Standards and Spec separately on a frozen scope.
The methodology has native acceptance evidence in
`docs/bontaflowstack/CORE-SKILL-METHODOLOGY-REPORT.md`. Installation and delivery
status must be checked against the actual selected release and local plugin.
