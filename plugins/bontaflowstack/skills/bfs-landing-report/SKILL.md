---
name: bfs-landing-report
description: "Read a repository's integration queue, version claims and check freshness without changing Git or remote state."
---

# BFS Landing Report

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `report`. Choose the mode from the actual request.

1. Select the repository, base, version source and live remote or supplied snapshot. Read local status through delivery status when relevant.
2. For selected live reads, use delivery queue with the explicit GitHub/GitLab host and repository, or the project's existing host tool.
3. Inspect actual query status, queue completeness, head/check state and version claims. A failed or truncated query cannot establish an empty queue.
4. Compare requested version candidates using delivery version. Keep proposed numbers separate from reservations; preserve three- or four-part semantics.
5. Report known activity, collisions, evidence age and missing fields. Inspect sibling workspaces only when they are explicitly in scope.
6. Give the next useful action from the observed state. This report does not reserve a version, merge changes or modify remote records.

## References

- [commands](../../references/commands.md)
