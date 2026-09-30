---
name: bfs-plan-eng-review
description: "Check a plan's architecture, correctness, data handling, tests, performance and implementation readiness against the actual codebase."
---

# BFS Plan Eng Review

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `bfs-review`. Choose the mode from the actual request.

1. Read the plan and trace the affected interfaces, data structures and real callers.
2. Walk a normal operation and a failure through the proposed components. Check validation, ownership, concurrency, retries, compatibility and recovery.
3. Prefer existing project facilities and native platform capabilities when they satisfy the specified behavior.
4. Identify data-loss risks, ambiguous contracts, missing migrations, resource limits and changes that invalidate existing evidence.
5. Map each significant risk to a concrete implementation adjustment and a discriminating test. Distinguish a necessary test from duplicated implementation checks.
6. Return ordered implementation tasks, unresolved technical choices and acceptance scenarios. Cite actual files or explain where the proposed component will fit.

## References

- [commands](../../references/commands.md)
- [review](../../references/review.md)
