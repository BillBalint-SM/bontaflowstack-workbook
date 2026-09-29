---
name: bfs-bontaflow-memory
description: "Read and maintain project decisions and learnings, search or export them, prune selected records, or explicitly import legacy notes."
---

# BFS BontaFlow Memory

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `read`, `write`, `prune`, `export`, `import`. Choose the mode from the actual request.

1. Select the actual project and requested read, write, prune, export or import operation. The runtime identifies the project; a note cannot choose another project's store.
2. Use memory list/search/stats for inspection. Empty results differ from read or parse failures; inspection creates no store.
3. Record a decision or learning with memory put using kind, key, text, rationale and the actual source: user-stated, observed or inferred. Confidence, when used, is 1 to 10. A revision keeps the key and kind.
4. For prune, identify exact record IDs and their effect on history. Execute memory prune for the selected records only; retain the recoverable backup.
5. Export redacted Markdown with memory export. Saving the export to a project file follows the requested destination and scope.
6. Import legacy decision/learning JSON or JSONL with memory import-legacy. First inspect the preview and project ownership, then use confirm: import for the chosen source. Unsupported formats remain untouched.
7. Verify writes by reading the relevant key or result. Return the local scope and actual record or export path.

Automatic workflow checkpoints are separate from durable memory entries. Use bfs-save-context and bfs-load-context for working snapshots. No background synchronization or cross-project search is performed.

## References

- [commands](../../references/commands.md)
