---
name: bfs-guard
description: "Inspect or explicitly change destructive-command warnings and a project edit boundary for the current Codex task."
---

# BFS Guard

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `status`, `warnings`, `boundary`, `combined`, `release`, `off`. Choose the mode from the actual request.

1. Read guard status for the current task and explain the requested change to warnings, edit boundary or both. Reuse the supplied directory and decisions.
2. Before a change, find the matching BFS_GUARD_OBSERVED marker in the actual native hook context. A manual hook invocation or test fixture is not proof of active native enforcement.
3. Use guard set with that observation and only the fields the user wants changed: warnings true/false and/or boundary. Resolve an existing directory inside the project.
4. Use guard release to clear only the boundary, or guard off for an explicitly requested removal of both protections.
5. Read status again and verify the actual state. If native enforcement is unavailable, report that limitation without claiming an active boundary.
6. If a native hook requests a decision for a risky command, present that exact command and target through the host's actual approval path. A hard boundary denial requires correcting the target or an explicit boundary change.

Coverage includes supported edit/patch paths and recognized destructive shell commands. This is not a sandbox for arbitrary shell filesystem writes. The protections are optional, task-specific and apply across all skills while active.

## References

When a command is stopped, use its exact pending ID only after the user has
authorized that specific operation. Call guard approve with the current native
observation and a quotation of the applicable authorization, then retry the
unchanged tool call once. This never overrides host permissions. New or changed
plugin hooks require user trust through Codex's `/hooks` review interface.

- [commands](../../references/commands.md)
