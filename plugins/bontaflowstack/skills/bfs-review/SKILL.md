---
name: bfs-review
description: "Review a code diff against requirements and callers, or repair and recheck requested defects."
---

# BFS Review

Load [HOST.md](../../HOST.md) via `read bfs-review`; follow its hash-based read protocol.
Modes: `inspect`, `fix`. Use inspect for review findings and fix for requested corrections. Default: `inspect`.

1. Read review and freeze the actual diff/file pair, base and target content. Read local changes so unrelated work remains identifiable. Resolve applicable project rules and the requirement source, including concrete conversation requirements.
2. Execute the Standards pass against that scope: trace changed definitions and callers for applicable rules and reachable correctness, data, security and maintenance risks.
3. Execute the Spec pass against the same scope: trace every in-scope requirement and acceptance case, including affected errors, recovery, exclusions and compatibility. Missing requirement source leaves Spec BLOCKED while Standards may proceed.
4. Record each axis result separately under review's status/evidence rules. Give every defect its axis, location, trigger/call path, consequence, evidence and practical fix. When independent review is requested, use review's separate-reviewer procedure and report its actual execution or blocker.
5. If requested, read external review findings for the selected repository and deduplicate them. Posting or resolving comments requires a request covering that action.
6. In fix mode, make the authorized correction and rerun affected checks.
7. For a persistent workflow result, bind evidence to the reviewed file bytes before and after inspection. Reuse a review only while its inputs and assumptions remain valid.

A style preference alone is not a correctness defect. A successful instruction read does not constitute a review.

Output: Frozen review scope, separate Standards/Spec statuses and evidence, prioritized axis-labelled defects and review limits.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [review](../../references/review.md): before freezing inputs, executing both axes or arranging requested independent reviewers.
