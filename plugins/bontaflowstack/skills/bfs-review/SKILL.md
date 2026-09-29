---
name: bfs-review
description: "Review a diff, patch or pull request for correctness, regressions and requirement coverage by tracing changed code and its callers."
---

# BFS Review

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `inspect`, `fix`. Choose the mode from the actual request.

1. Resolve the actual diff or file pair and its verified base. Read local changes before review so unrelated work remains identifiable.
2. Trace the requested behavior through changed definitions and callers. Compare implementation with explicit requirements and acceptance cases.
3. Prioritize wrong results, data loss, security and concurrency, then inspect error handling, compatibility, performance and affected tests. Apply the relevant perspectives from the shared review reference.
4. For every finding identify its location, triggering input, real call path and consequence. Separate a demonstrated defect from an unresolved suspicion.
5. If requested, read external review findings for the selected repository and deduplicate them. Posting or resolving comments requires a request covering that action.
6. Return prioritized findings, practical fixes, reviewed scope and verification limits. In fix mode, make the authorized correction and rerun affected checks.
7. For a persistent workflow result, bind evidence to the reviewed file bytes before and after inspection. Reuse a review only while its inputs and assumptions remain valid.

A style preference alone is not a correctness defect. A successful instruction read does not constitute a review.

## References

- [commands](../../references/commands.md)
- [review](../../references/review.md)
