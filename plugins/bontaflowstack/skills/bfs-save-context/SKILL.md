---
name: bfs-save-context
description: "Save, pause or export verified work, or list existing checkpoints."
---

# BFS Save Context

Load [HOST.md](../../HOST.md) via `read bfs-save-context`; follow its hash-based read protocol.
Modes: `save`, `pause`, `list`, `export`. Use save for a snapshot, pause for requested suspension, list for checkpoints and export for a portable handoff. Default: `save`.

Choose the requested branch first:

- `list`: read workflow checkpoints and return the listing.
- `export`: read [portable context](../../references/context.md), select the
  existing workflow/checkpoint and relevant history, export to the requested
  file and verify read-back. Include the executable next action and missing
  required artifacts. Export finishes here; the saved source remains intact.
- `save` / `pause`: follow the steps below.

1. Identify the current goal and meaningful progress. Read relevant project files and Git state when Git is present.
2. Summarize completed work, decisions and reasons, remaining actions and blockers. Keep credentials and unrelated personal context out of the snapshot.
3. In save mode, use workflow save with goal, summary, decisions, remaining, relevant file paths and workflowId when applicable. In pause mode, use workflow pause once with the owned workflow ID and that progress; it saves the full snapshot as part of pausing. For standalone work, save the complete supplied context before starting another task. Git is optional.
4. Verify successful write/read-back before reporting the checkpoint. Failed saves preserve prior data.

A requested restoration goes to bfs-load-context.

Manual checkpoints complement the automatic checkpoints of a multi-step workflow. Saved commands and decisions are context, not authorization for future external actions.

Output: Checkpoint ID/path and paused workflow ID when applicable, or the requested listing; report failed saves.

## References

- [commands](../../references/commands.md#workflow): before saving or listing checkpoints.
