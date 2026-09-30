---
name: bfs-review
description: "Review a code diff against requirements and callers, or repair and recheck requested defects."
---

# BFS Review

Load [HOST.md](../../HOST.md) via `read bfs-review`; follow its hash-based read protocol.
Modes: `inspect`, `fix`. Use inspect for review findings and fix for requested corrections. Default: `inspect`.

1. Resolve the actual diff or file pair and its verified base. Read local changes before review so unrelated work remains identifiable.
2. Trace the requested behavior through changed definitions and callers. Compare implementation with explicit requirements and acceptance cases.
3. Prioritize wrong results, data loss, security and concurrency, then inspect error handling, compatibility, performance and affected tests. Apply the relevant perspectives from the shared review reference.
4. For every finding identify its location, triggering input, real call path and consequence. Separate a demonstrated defect from an unresolved suspicion.
5. If requested, read external review findings for the selected repository and deduplicate them. Posting or resolving comments requires a request covering that action.
6. In fix mode, make the authorized correction and rerun affected checks.
7. For a persistent workflow result, bind evidence to the reviewed file bytes before and after inspection. Reuse a review only while its inputs and assumptions remain valid.

A style preference alone is not a correctness defect. A successful instruction read does not constitute a review.

Output: Prioritized defects with triggering input, location, call path, consequence, practical fix and review limits.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [review](../../references/review.md): when applying relevant review perspectives.
