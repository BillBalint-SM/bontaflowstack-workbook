---
name: bfs-health
description: "Run existing project checks and report commands, results and verification limits."
---

# BFS Health

Load [HOST.md](../../HOST.md) via `read bfs-health`; follow its hash-based read protocol.
Mode: `check`.

1. Read the project's documented commands and relevant package or build configuration.
2. Select checks covering the requested change or health question. Resolve actual prerequisites and the intended working directory.
3. Run the selected existing commands, preserving exit codes and diagnostics. Use delivery evidence when a content-bound persistent record is needed.
4. Distinguish product failures, pre-existing failures, missing tools and inaccessible services. A skipped check remains untested.

Output: Exact commands, exit/results, affected scope and next useful action.

## References

- [commands](../../references/commands.md): when constructing a core request.
