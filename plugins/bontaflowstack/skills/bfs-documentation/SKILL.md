---
name: bfs-documentation
description: "Create missing project documentation or update existing guides, references and release notes from verified source and actual behavior."
---

# BFS Documentation

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `create`, `update`, `coverage`. Choose the mode from the actual request.

1. Identify the audience, requested documentation and the source change or module it must explain.
2. Compare current documents with source, interfaces, configuration and executable examples. Build a small coverage list of missing, inaccurate and still-correct sections.
3. Create missing material and update existing material according to the requested scope. Preserve useful organization and factual content.
4. Explain purpose, prerequisites, first use, examples, normal results and common recovery steps. Keep user-facing instructions focused on their task.
5. Verify commands against the actual environment where feasible, validate links and confirm names/defaults with source. Clearly label examples that could not be executed.
6. Read the resulting documents as a new user and check that every changed behavior is covered. Return files, verified examples and remaining gaps.

Coverage mode reports gaps without editing. Release documentation describes actual delivered behavior and actual limitations, rather than future plans.

## References

- [commands](../../references/commands.md)
