---
name: bfs-documentation
description: "Create or update source-verified project documentation, or report documentation gaps."
---

# BFS Documentation

Load [HOST.md](../../HOST.md) via `read bfs-documentation`; follow its hash-based read protocol.
Modes: `create`, `update`, `coverage`. Use create for missing documents, update for existing material, and coverage for a read-only gap report. Default: `create`.

1. Identify the audience, requested documentation and the source change or module it must explain.
2. Compare current documents with source, interfaces, configuration and executable examples. Build a small coverage list of missing, inaccurate and still-correct sections.
3. Create missing material and update existing material according to the requested scope. Preserve useful organization and factual content.
4. Explain purpose, prerequisites, first use, examples, normal results and common recovery steps. Keep user-facing instructions focused on their task.
5. Verify commands against the actual environment where feasible, validate links and confirm names/defaults with source. Clearly label examples that could not be executed.
6. Read the resulting documents as a new user and check that every changed behavior is covered.

Coverage mode reports gaps without editing. Release documentation describes actual delivered behavior and actual limitations, rather than future plans.

Output: Documentation files or coverage report, verified examples and remaining gaps.

## References

- [commands](../../references/commands.md): when constructing a core request.
