---
name: bfs-guard
description: "Inspect or explicitly change current-task command warnings and the project edit boundary."
---

# BFS Guard

Load [HOST.md](../../HOST.md) via `read bfs-guard`; follow its hash-based read protocol.
Modes: `status`, `warnings`, `boundary`, `combined`, `release`, `off`. Use status to inspect, warnings/boundary/combined to change the named protection, release to clear the boundary, and off to disable both. Default: `status`.

1. Read current-task status and the [guard rules](../../references/guard.md) before changes or stopped-command handling.
2. Change only requested warnings/boundary fields using native observation; resolve the boundary to an existing project directory.
3. Release only the boundary, or disable both protections only when requested.
4. Read status back; report missing native enforcement rather than claiming an active boundary.

Output: Verified guard status, changed protections and native-enforcement limitations.

## References

- [guard](../../references/guard.md): before guard changes, hook checks or stopped-command handling.
- [commands](../../references/commands.md#guard): before constructing guard requests.
