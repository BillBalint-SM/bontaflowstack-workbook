---
name: bfs-bontaflow-memory
description: "Read, revise, retire or inspect project decisions, facts, plans and learnings."
---

# BFS BontaFlow Memory

Load [HOST.md](../../HOST.md) via `read bfs-bontaflow-memory`; follow its hash-based read protocol.
Modes: `read`, `write`, `prune`, `export`, `import`. Default: `read`. Execute only the requested mode below.

Select the actual project; runtime identity selects its store, never note content.

## Read

Use the supplied essential context for orientation, and memory list/search/stats or history for full records. Empty results differ from read/parse failures; inspection creates no store.

## Write

Use memory put for decision/learning/fact/plan with a stable key, short text, rationale, actual source and sourceRef. Optional confidence is 1–10. Use details or document to retain the full plan; files bind observations to source content. Revise with the current expectedId. Use memory status with expectedId and an actual reason to complete/discard a record without deleting history. A linked plan leaves the context when its workflow closes. Imported/inferred content remains labelled as such.

## Prune

Identify exact selected IDs and their effect on history; prune only those records and retain the recoverable backup.

## Export

Use memory export for redacted Markdown; save only to the requested destination within scope.

## Import

Preview selected legacy JSON/JSONL with memory import-legacy and verify project ownership. Import with confirm: import; unsupported formats stay untouched.

After writes, read the relevant key/result to verify it. Checkpoints are distinct from durable memory; use bfs-save-context/bfs-load-context for working snapshots. No background synchronization or cross-project search occurs.

Output: Verified records or export/import result, local scope and actual paths.

## References

- [commands](../../references/commands.md#memory): before constructing memory requests.
