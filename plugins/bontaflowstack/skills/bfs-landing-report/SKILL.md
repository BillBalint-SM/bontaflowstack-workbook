---
name: bfs-landing-report
description: "Report integration queue, version conflicts and check freshness without changing repository state."
---

# BFS Landing Report

Load [HOST.md](../../HOST.md) via `read bfs-landing-report`; follow its hash-based read protocol.
Mode: `report`.

1. Select the repository, base, version source and live remote or supplied snapshot. Read local status through delivery status when relevant.
2. For selected live reads, use delivery queue with the explicit GitHub/GitLab host and repository, or the project's existing host tool.
3. Inspect actual query status, queue completeness, head/check state and version claims. A failed or truncated query cannot establish an empty queue.
4. Compare requested version candidates using delivery version. Keep proposed numbers separate from reservations; preserve three- or four-part semantics.
5. Inspect sibling workspaces only when explicitly in scope. Derive the next action from observed state; this report reserves no version and changes no remote records.

Output: Observed activity, version collisions, evidence age, missing fields and next action.

## References

- [delivery](../../references/delivery.md): before assessing queue/check freshness or version claims.
- [commands](../../references/commands.md#delivery): before requesting status, queue or version data.
