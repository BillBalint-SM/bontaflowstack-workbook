---
name: load-context
description: "Load a manual or automatic checkpoint, identify changed inputs and resume the requested work from a verified next step."
---

# Restore working context

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `load`, `resume`. Choose the mode from the actual request.

1. List workflow list and workflow checkpoints for the current project. Use the requested ID, or prefer the current workspace's relevant recent record; ask only when the choice is ambiguous.
2. Call workflow resume with the chosen ID. Read the goal, steps, decisions, next action and content drift.
3. Inspect changed files and environment dependencies. Mark affected earlier checks stale and decide what must be rechecked before dependent work.
4. Present the recovered state and next executable action. Loading alone does not execute external commands.
5. When continuation is requested in a new task of the same workspace, use workflow adopt with confirm: resume, then resume through bfs-driver. Another worktree starts its own workflow from the recovered summary.
6. For a prior uncertain merge, deployment or other external action, inspect the real remote state before retrying. Keep the old record as context, not permission.

A missing or malformed checkpoint is a visible error. A manually saved snapshot can seed a new workflow without altering its original file.
For a user-selected legacy text/Markdown snapshot, preview workflow import-legacy
and import it explicitly as historical context. Old permissions and check results
remain unverified; the original file stays untouched.

## References

- [commands](../../references/commands.md)
