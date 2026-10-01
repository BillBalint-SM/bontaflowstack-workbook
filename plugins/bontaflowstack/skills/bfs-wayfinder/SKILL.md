---
name: bfs-wayfinder
description: "Find the next useful project step from current context, workflow and task status."
---

# BFS Wayfinder

Load [HOST.md](../../HOST.md) via `read bfs-wayfinder`; follow its hash-based read protocol.
Mode: `guide`.

1. Read the supplied essential context. Follow its detail pointers only for a relevant active record, history entry, workflow or task plan; inspect current source/state when freshness matters. For a parallel-work goal without a named plan ID, use `tasks list` to find the matching plan, then `tasks status` for that ID.
2. Report where the project stands using current evidence: completed, active, blocked, waiting and stale work. Preserve unresolved decisions and distinguish historical evidence from current readiness.
3. Recommend the single next useful action, identify its prerequisite and explain why it advances the stated goal. If nothing is actionable, say what exact input or capability is missing.
4. Keep this a read-only guide. Do not create workflows, revise memory, assign workers, implement changes or start an unrequested phase. For a new task, recommend `bfs-router`; for an existing checkpoint, recommend `bfs-load-context`.

Output: Current position with source references, blockers/stale items, and one justified next step. Leave project, workflow and memory state unchanged.

## References

- [Wayfinding evidence contract](../../references/wayfinder.md).
- [Context and workflow commands](../../references/commands.md#essential-context).
