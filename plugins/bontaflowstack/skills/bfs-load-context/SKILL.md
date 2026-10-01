---
name: bfs-load-context
description: "Recover checkpoint state, detect drift and resume from a verified next step."
---

# BFS Load Context

Load [HOST.md](../../HOST.md) via `read bfs-load-context`; follow its hash-based read protocol.
Modes: `load`, `resume`, `import`. Use load for inspection, resume for requested continuation and import for a selected portable handoff. Default: `load`.

1. Start from the supplied essential context and requested ID. Use workflow list/checkpoints for missing detail; prefer the relevant current-workspace record. Ask only when materially different candidates remain ambiguous.
   For a supplied handoff file, read [portable context](../../references/context.md), preview `workflow import-handoff` and inspect its full selected history. A request to import supplies `confirm: import`; inspection alone remains read-only. Continue from the returned current-workspace checkpoint ID.
2. Call workflow resume with the chosen ID. Read the goal, steps, decisions, next action and content drift. When it has checkpointId, also read that saved snapshot and reconcile its detail with any newer workflow progress.
3. Inspect changed files and environment dependencies. Mark affected earlier checks stale and decide what must be rechecked before dependent work.
4. Present the recovered state and next executable action. Loading alone does not execute external commands.
5. For requested continuation of paused work or a new task in the same workspace, use workflow adopt with confirm: resume, then continue the pending operation through bfs-router. The user's resume request supplies this choice; do not ask it again. Another worktree starts its own workflow from the full recovered snapshot. Completed/discarded records remain historical.
6. For a prior uncertain merge, deployment or other external action, inspect the real remote state before retrying. Keep the old record as context, not permission.
7. Imported snapshots retain their origin and full history without merging project memory or starting a workflow. Read their `handoff` detail before continuation; recover the accepted basis from the current user request, check source fingerprints and required artifacts, then start a new workflow with `sourceCheckpointId` when needed. The linked workflow replaces the snapshot in active context; completed/discarded imports remain historical.

A missing or malformed checkpoint is a visible error. A manually saved snapshot can seed a new workflow without altering its original file.
For a user-selected legacy text/Markdown snapshot, preview workflow import-legacy
and import it explicitly as historical context. Old permissions and check results
remain unverified; the original file stays untouched.

Output: Recovered goal, decisions, drift, stale checks, next action and adoption status when applicable.

## References

- [commands](../../references/commands.md#workflow): before loading, importing or adopting workflow/checkpoint state.
