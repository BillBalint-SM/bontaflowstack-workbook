---
name: bfs-save-context
description: "Save or pause verified work, or list existing checkpoints."
---

# BFS Save Context

Load [HOST.md](../../HOST.md) via `read bfs-save-context`; follow its hash-based read protocol.
Modes: `save`, `pause`, `list`. Use save for a snapshot, pause for requested suspension and list for existing checkpoints. Default: `save`.

1. Identify the current goal and meaningful progress. Read relevant project files and Git state when Git is present.
2. Summarize completed work, decisions and reasons, remaining actions and blockers. Keep credentials and unrelated personal context out of the snapshot.
3. Use workflow save with goal, summary, decisions, remaining, relevant file paths and workflowId when applicable. In pause mode, use workflow pause with the owned workflow ID and that progress; it captures the full saved workflow before pausing. For standalone work, save the complete supplied context before starting another task. Git is optional.
4. Verify successful write/read-back before reporting the checkpoint. Failed saves preserve prior data.
5. For listing, use workflow checkpoints without creating a new checkpoint. A requested restoration goes to bfs-load-context.

Manual checkpoints complement the automatic checkpoints of a multi-step workflow. Saved commands and decisions are context, not authorization for future external actions.

Output: Checkpoint ID/path and paused workflow ID when applicable, or the requested listing; report failed saves.

## References

- [commands](../../references/commands.md#workflow): before saving or listing checkpoints.
