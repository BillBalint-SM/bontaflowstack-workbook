---
name: bfs-save-context
description: "Create a manual local checkpoint of the goal, progress, decisions and remaining work, or list existing checkpoints."
---

# BFS Save Context

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `save`, `list`. Choose the mode from the actual request.

1. Identify the current goal and meaningful progress. Read relevant project files and Git state when Git is present.
2. Summarize completed work, decisions and reasons, remaining actions and blockers. Keep credentials and unrelated personal context out of the snapshot.
3. Use workflow save with goal, summary, decisions, remaining and the relevant file paths. Git is optional; the runtime records the project, task and content fingerprints.
4. Return the exact checkpoint ID and path only after successful write/read-back. A failed save preserves the prior data and is reported as failed.
5. For listing, use workflow checkpoints without creating a new checkpoint. A requested restoration goes to bfs-load-context.

Manual checkpoints complement the automatic checkpoints of a multi-step workflow. Saved commands and decisions are context, not authorization for future external actions.

## References

- [commands](../../references/commands.md)
