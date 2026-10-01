---
name: bfs-triage
description: "Turn a reported problem into an evidence-based, prioritized triage report and next route."
---

# BFS Triage

Load [HOST.md](../../HOST.md) via `read bfs-triage`; follow its hash-based read protocol.
Mode: `report`.

1. Preserve the report as received. Inspect only supplied/current project evidence relevant to reproducing it; separate observed facts, user claims and hypotheses.
2. Record expected and actual behavior, smallest reproduction, environment, impact, affected journey, workaround, provenance and known related reports. Cite evidence for a duplicate or relationship.
3. Assign P0 for data loss, reachable security exposure or service outage; P1 for a blocked primary journey; P2 when a workable path remains; P3 for limited impact. If impact is unknown, leave priority unknown and ask only for the missing fact that could change it.
4. State root cause only when a reproducer or source evidence establishes it. Otherwise name the unknown and recommend `bfs-bug-issue-investigate` for diagnosis; load that skill only if investigation is selected.
5. Recommend one next action with its reason: missing requirement → `bfs-spec`; reproducible defect → `bfs-bug-issue-investigate`; accepted repair → `bfs-implement`. Keep the triage report local. Issue creation, code edits and repair are separate requested actions.

Output: Evidence-linked triage report with impact, priority or explicit unknown, reproduction, related-work evidence, facts versus hypotheses, missing input and one next route.

## References

- [Triage report contract](../../references/triage.md).
- The catalog entry `bfs-bug-issue-investigate` for root-cause work.
