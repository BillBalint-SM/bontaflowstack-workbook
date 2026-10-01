# Context closure contracts

Implements the user-accepted [plan](CONTEXT-CLOSURE-PLAN.md). These are additive
source interfaces; installed 0.6.0 does not yet provide them.

## Portable handoff

`workflow export` takes a saved workflow/checkpoint `id`, optional `memory`
selectors (`kind`, `key`), `evidenceIds`, `next`, `suggestedSkills` and `output`.
Without output it returns Markdown; an explicitly selected output receives an
atomic UTF-8 write. Existing different content requires `overwrite: true`.
Selection includes full memory revision chains, never a truncated current view.

The Markdown contains exactly one `bfs-handoff-json` fence. Schema 1 has type
`bfs-handoff`, createdAt, origin, checkpoint, workflow (or null), memory, evidence,
next, suggestedSkills and payloadSha256. The checksum detects content drift,
not authorship or permission. Maximum UTF-8 file size: 8 MiB. All stored project
file pointers are relative; old workspace/task identities are historical data.
No credentials, links in source/output paths, traversal or unsupported schemas.

`workflow import-handoff` takes `file`. Default is a read-only preview with
drift, source status and historical verification. `confirm: import` writes one
immutable checkpoint in the current project's existing store. Its deterministic
ID derives from the payload hash; concurrent/repeated imports reuse it.
The checkpoint embeds the entire selected payload, retains original fingerprints
and is labelled imported with authorizationImported false. No memory merge,
source-file restoration, workflow execution, guard import or saved-command run.
Closed source work stays historical and leaves the active context view.

Resume inspects source drift; a new workspace creates its own workflow after
rechecking relevant prerequisites. Missing source artifacts remain blockers.
Imported evidence and acceptance quotes remain historical context.

## Delivery proof

Existing `delivery evidence` gains optional `workflowId`, `stage` and `subject`.
Stage is prepare/publish/integrate/deploy/verify; stage requires workflowId and
subject. Subject identifies target and sourceRevision, optionally repository,
provider, change, expected revision/version/artifactSha256. Evidence retains the
actual command, exit, stdout/stderr, file fingerprints and observation time.

External status queries may return one JSON object with status
completed/pending/unknown/not-applicable, provider, target, optional revision,
version, artifactSha256, reference and reason. This is the project's normalized
status-query output; stdout and the executed command retain its provenance.
Plain successful command output or a supplied URL cannot certify live delivery.
Not-applicable needs an explicit reason. Unparseable output remains UNKNOWN.

`delivery report` selects workflowId, expected subject and requested stages.
It derives latest stage results from existing evidence; absent requested stages
are MISSING, other stages NOT-REQUESTED. Failed/new pending/stale observations
cannot fall back to older green evidence. Subject differences are MISMATCH.
The report separates file validity from historical external observations and
always states liveVerified false: report construction runs no provider commands.

`delivery verify` retains old local evidence checks. For external stage evidence,
current verification requires an explicitly supplied `command` argument array:
the caller supplies the authorized current status query, never an automatically
replayed stored command. It creates a new verify evidence record and compares
its actual normalized output with the expected subject. Missing query means
UNKNOWN/liveVerified false; a failed query or mismatch is not a live PASS.
There is no TTL-based proof and no provider-specific deployment framework.

## Retro

`bfs-retro` is an independent report skill using selected workflow/checkpoint,
evidence and session artifacts. Default mode report, no engine requirement.
Material recovery or explicit user request selects it; ordinary success does
not add an interview or required workflow step. No automatic environment edits.
Learning persistence uses existing memory put/history/status and actual source;
a proposed remedy remains inferred and never becomes accepted policy by itself.

Tests use existing Node tests and CLI boundaries. Source instructions require
fresh native sessions; no schema/text check substitutes for their behavior.
