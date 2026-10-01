---
name: bfs-retro
description: "Review actual work traces for reusable lessons, distinguishing mechanical checks from judgment."
---

# BFS Retro

Load [HOST.md](../../HOST.md) via `read bfs-retro`; follow its hash-based read protocol.
Mode: `report`.

1. Select the requested workflow/session and inspect its primary trace, actual
   failures, recovery, changed inputs and delivery evidence. Identify missing
   evidence; an inferred explanation stays a hypothesis.
2. Separate mechanical failures from judgment errors. For a reproducible
   invariant, first reuse the existing runnable check. For a decision problem,
   state the missing information, alternative and observable outcome that could
   test it. Avoid claiming a check proves product judgment.
3. Report only useful findings: trace reference, consequence, proposed remedy
   and verification. Explain uncertainty and whether a remedy is accepted.
4. When the user requests retaining a lesson, use existing project `memory put`
   with kind learning, a stable key, real source/sourceRef, details and relevant
   files. Read back; revise with expectedId and retire obsolete lessons through
   memory status. Preserve observed facts separately from inferred remedies.
5. Hand requested repairs to bfs-bug-issue-investigate or bfs-implement. Rule,
   CI, hook or global instruction changes require their own accepted scope.

Use relevant active project lessons on later work; inspect their full provenance
and source drift before applying them. Simple closure needs no retro interview.

Output: Evidence-based findings, mechanical/judgment distinction, uncertainty,
proposed verification and any explicitly requested saved learning IDs.

## References

- [commands](../../references/commands.md#memory): before reading or revising lessons.
- [delivery](../../references/delivery.md): when reviewing delivery evidence.
