---
name: bfs-autoplan
description: "Review a concrete plan through the relevant business, design, developer-experience and engineering perspectives, preserving decisions and unresolved findings."
---

# BFS Autoplan

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `bfs-review`. Choose the mode from the actual request.

1. Obtain a usable plan and the user's intended review scope. Reuse an existing brief or specification; develop missing inputs only within the requested task.
2. Select the relevant independent reviews: bfs-plan-ceo-review for value and scope, bfs-plan-design-review for UI, bfs-plan-devex-review for developer surfaces, and bfs-plan-eng-review for implementation. Engineering reviews the final proposed content.
3. Load and execute one selected review at a time. Give it the current plan, known decisions, relevant source and the result expected from that review.
4. Preserve findings as accepted, proposed, deferred or unresolved with the actual decision source. Reconcile conflicts using evidence and user priorities.
5. If plan edits are requested, apply the agreed changes before passing the plan onward. Recheck results whose inputs changed.
6. Return the reviewed plan, executed or reused perspectives, acceptance cases, implementation order and open decisions. Record verified phase findings as evidence for this workflow step.

A narrow plan need not run every perspective. Reading review instructions alone is not execution.
When the requested workflow includes implementation, pass the reviewed plan to bfs-implement after the user's acceptance of that version. Its accepted-basis rules govern the transition; review completion alone does not start implementation.

## References

- [commands](../../references/commands.md)
