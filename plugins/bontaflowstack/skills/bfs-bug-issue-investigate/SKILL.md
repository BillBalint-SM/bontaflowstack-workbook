---
name: bfs-bug-issue-investigate
description: "Reproduce a bug or issue, trace the actual cause, and perform a requested focused repair with regression verification."
---

# BFS Bug Issue Investigate

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `diagnose`, `fix`. Choose the mode from the actual request.

1. Capture expected and actual behavior, failing input, environment and original error. Read relevant source, recent changes and callers.
2. Reproduce the smallest failing path using existing checks or an isolated example. Preserve unrelated work and the original diagnostic.
3. Form a falsifiable explanation, trace it through the shared implementation, and choose a check that distinguishes it from competing causes.
4. Run the targeted check and revise the explanation when evidence contradicts it. Report missing services, credentials or inputs as blockers.
5. In requested fix mode, repair the shared cause with a small change and a meaningful regression check when behavior changes. Respect active guard policy; enabling guard is optional.
6. Re-run the original reproduction and affected checks. Use bfs-health or bfs-review when required by the selected task, without widening the work merely to collect green results.
7. Return cause, evidence, changes and remaining uncertainty. Store reusable lessons through bfs-bontaflow-memory when requested.

Diagnosis mode produces findings without source changes. A hypothesis is not a verified cause.

## References

- [commands](../../references/commands.md)
