---
name: bfs-health
description: "Run the project's existing tests, lint, type checks or build checks and report their actual results and limits."
---

# BFS Health

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `check`. Choose the mode from the actual request.

1. Read the project's documented commands and relevant package or build configuration.
2. Select checks covering the requested change or health question. Resolve actual prerequisites and the intended working directory.
3. Run the selected existing commands, preserving exit codes and diagnostics. Use delivery evidence when a content-bound persistent record is needed.
4. Distinguish product failures, pre-existing failures, missing tools and inaccessible services. A skipped check remains untested.
5. Return the exact commands, results, affected scope and the next useful action. Test failure is not permission to modify source or weaken assertions.

## References

- [commands](../../references/commands.md)
