---
name: bfs-save-context
description: "Save a verified progress checkpoint or list existing checkpoints."
---

# BFS Save Context

Load [HOST.md](../../HOST.md) via `read bfs-save-context`; follow its hash-based read protocol.
Modes: `save`, `list`. Use save for a new snapshot and list for existing checkpoints. Default: `save`.

1. Identify the current goal and meaningful progress. Read relevant project files and Git state when Git is present.
2. Summarize completed work, decisions and reasons, remaining actions and blockers. Keep credentials and unrelated personal context out of the snapshot.
3. Use workflow save with goal, summary, decisions, remaining and the relevant file paths. Git is optional; the runtime records the project, task and content fingerprints.
4. Verify successful write/read-back before reporting the checkpoint. Failed saves preserve prior data.
5. For listing, use workflow checkpoints without creating a new checkpoint. A requested restoration goes to bfs-load-context.

Manual checkpoints complement the automatic checkpoints of a multi-step workflow. Saved commands and decisions are context, not authorization for future external actions.

Output: Checkpoint ID/path after successful write/read-back, or the requested listing; report failed saves.

## References

- [commands](../../references/commands.md#workflow): before saving or listing checkpoints.
