---
name: bfs-bontaflow-memory
description: "Read, write, prune, export or explicitly import project decisions and learnings."
---

# BFS BontaFlow Memory

Load [HOST.md](../../HOST.md) via `read bfs-bontaflow-memory`; follow its hash-based read protocol.
Modes: `read`, `write`, `prune`, `export`, `import`. Default: `read`. Execute only the requested mode below.

Select the actual project; runtime identity selects its store, never note content.

## Read

Inspect with memory list/search/stats. Empty results differ from read/parse failures; inspection creates no store.

## Write

Use memory put for a decision/learning with kind, key, text, rationale and actual source: user-stated, observed or inferred. Optional confidence is 1–10. Revisions retain key and kind.

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
