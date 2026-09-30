---
name: bfs-autoplan
description: "Coordinate relevant plan reviews and return a reconciled plan with open decisions."
---

# BFS Autoplan

Load [HOST.md](../../HOST.md) via `read bfs-autoplan`; follow its hash-based read protocol.
Mode: `review`.

1. Obtain a usable plan and the user's intended review scope. Reuse an existing brief or specification; develop missing inputs only within the requested task.
2. Select the relevant independent reviews: bfs-plan-ceo-review for value and scope, bfs-plan-design-review for UI, bfs-plan-devex-review for developer surfaces, and bfs-plan-eng-review for implementation. Engineering reviews the final proposed content.
3. Load and execute one selected review at a time. Give it the current plan, known decisions, relevant source and the result expected from that review.
4. Preserve findings as accepted, proposed, deferred or unresolved with the actual decision source. Reconcile conflicts using evidence and user priorities.
5. If plan edits are requested, apply the agreed changes before passing the plan onward. Recheck results whose inputs changed.
6. For multiple tasks or dependencies, read planning and reconcile the final task list against review findings. Validate blockers, acceptance coverage and currently valid evidence before identifying ready tasks. Record verified phase findings as evidence for this workflow step.

A narrow plan need not run every perspective. Reading review instructions alone is not execution.
When the requested workflow includes implementation, pass the reviewed plan to bfs-implement after the user's acceptance of that version. Its accepted-basis rules govern the transition; review completion alone does not start implementation.

Output: Reviewed plan, executed/reused perspectives, acceptance cases, implementation order and open decisions.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [planning](../../references/planning.md): before reconciling task dependencies and readiness.
