---
name: bfs-plan-eng-review
description: "Review a plan against the codebase for architecture, correctness and implementation readiness."
---

# BFS Plan Eng Review

Load [HOST.md](../../HOST.md) via `read bfs-plan-eng-review`; follow its hash-based read protocol.
Mode: `review`.

1. Read the plan and trace the affected interfaces, data structures and real callers.
2. Walk a normal operation and a failure through the proposed components. Check validation, ownership, concurrency, retries, compatibility and recovery.
3. Prefer existing project facilities and native platform capabilities when they satisfy the specified behavior.
4. Identify data-loss risks, ambiguous contracts, missing migrations, resource limits and changes that invalidate existing evidence.
5. Map each significant risk to a concrete implementation adjustment and a discriminating test. Distinguish a necessary test from duplicated implementation checks.

Output: Ordered implementation tasks, technical decisions and acceptance scenarios with cited files or the proposed component location.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [review](../../references/review.md): when applying relevant review perspectives.
