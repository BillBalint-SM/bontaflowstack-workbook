---
name: bfs-bug-issue-investigate
description: "Diagnose a reproducible bug, or fix its shared cause and verify the regression."
---

# BFS Bug Issue Investigate

Load [HOST.md](../../HOST.md) via `read bfs-bug-issue-investigate`; follow its hash-based read protocol.
Modes: `diagnose`, `fix`. Use diagnose for investigation and fix for a requested repair. Default: `diagnose`.

1. Capture expected and actual behavior, failing input, environment and original error. Read relevant source, recent changes and callers.
2. Reproduce the smallest failing path using existing checks or an isolated example. Preserve unrelated work and the original diagnostic.
3. Form a falsifiable explanation, trace it through the shared implementation, and choose a check that distinguishes it from competing causes.
4. Run the targeted check and revise the explanation when evidence contradicts it. Report missing services, credentials or inputs as blockers.
5. In requested fix mode, load bfs-implement and pass expected behavior, the original reproduction/diagnostic, verified cause and accepted repair scope to its TDD procedure. Apply that procedure inside the active investigation step, preserving red/green evidence. Complete this fix step only after the repair and original reproduction pass; diagnosis alone leaves it running or blocked. Respect active guard policy; enabling guard is optional.
6. Re-run the original reproduction and affected checks. Use bfs-health or bfs-review when required by the selected task, without widening the work merely to collect green results.
7. Store reusable lessons through bfs-bontaflow-memory when requested.

Diagnosis mode produces findings without source changes. A hypothesis is not a verified cause.

Output: Verified cause, reproduction evidence, changes and remaining uncertainty.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [bfs-implement](../bfs-implement/SKILL.md#tdd): after diagnosing the cause of a requested repair; load it through `read bfs-implement`.
