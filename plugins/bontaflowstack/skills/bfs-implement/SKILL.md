---
name: bfs-implement
description: "Implement an accepted plan, spec, design or scoped change and verify its acceptance criteria."
---

# BFS Implement

Load [HOST.md](../../HOST.md) via `read bfs-implement`; follow its hash-based read protocol.
Mode: `implement`.

## Accepted basis

Identify the accepted basis and actual user message before editing. Concrete conversation text suffices. A direct implementation request accepts its identified basis without duplicate permission; a planning request stays planning-only. Reviews, approval labels and saved summaries do not establish acceptance.

Missing/ambiguous acceptance, incompatible requirements or material revisions require a concrete decision and `waiting`; dependent work stays pending while inspection may continue. Routine choices within accepted scope need no further approval. HOST governs external actions.

## Implement and verify

1. Inspect source and project checks against the accepted basis; preserve unrelated edits and reuse actual acceptance. Use the current workflow or start a standalone bfs-implement workflow.
2. Before editing, `workflow save` the basis, actual acceptance reference/quote, scope and criteria in summary/decisions. Include basis files in `files` to bind content; record accepted text for conversation-only input. This checkpoint records acceptance, not permission.
3. Begin with stable accepted documents as inputs and changed files as outputs. For several tasks, use planning to select the next task with verified current blockers. Apply TDD below to behavior changes in the existing stack; save verified progress, output files, evidence and remaining work. Keep revisions of the same files in one active step, completed with final verified outputs.
4. For accepted UI work, use bfs-design-html when its implementation/rendering procedure applies, within this workflow. Missing browser capability blocks only browser checks.
5. Verify each part against accepted behavior using relevant checks and observed results; repair demonstrated in-scope failures. Record changed paths, evidence, limitations and next action. Required verification that cannot finish leaves the step blocked or failed.
6. If the basis changes or work requires material scope/behavior/design revision, record `waiting`, present the revision and obtain acceptance before proceeding. On resume, check drift and recover the actual acceptance source.
7. Use bfs-health, bfs-review, bfs-qa or bfs-finisher for the requested outcome. Complete only after required acceptance checks pass.

Output: Implemented acceptance criteria, verification evidence, changed paths and unresolved work.

## Requested parallel implementation

For an accepted task graph with requested parallel execution, read
[parallel execution](../../references/parallel.md). Validate its graph and current
readiness, give independent write scopes to separate workers/worktrees, and keep
each worker's own workflow. Record actual committed results and integrate serially
with fresh checks before releasing dependent tasks. One ready task follows the
normal procedure above; parallelism does not add a mandatory phase.

## TDD

This skill owns the red/green/refactor procedure, including repairs handed over by
bfs-bug-issue-investigate. Reuse its original reproduction and verified cause inside
the active calling step. Loading this procedure selects instructions; it does not
advance or complete that step, create another workflow or renew repair approval.

1. Discover the project's actual focused and regression commands. Select one
   observable acceptance behavior and its public test boundary using testing.
   Reuse a discriminating reproduction or add the smallest meaningful test.
2. **RED:** run it before changing product behavior. Record the command, exit and
   diagnostic showing the intended mismatch. Import/setup errors or unavailable
   services are blockers, not behavioral RED. Repair permitted local setup or
   report the blocked check; independent work may continue. An already-green
   case is existing coverage, not proof of a reproduced defect.
3. **GREEN:** make the smallest change that satisfies that behavior. Run the same
   test without weakening its expected result; retain its actual exit/output.
   Continue only after the intended assertion passes.
4. **REFACTOR:** improve only when a concrete maintenance need justifies it and
   rerun affected tests. Then verify related regressions and acceptance cases
   before marking the task complete. Repeat for the next ready behavior.

For documentation, configuration or trivial formatting, verify the actual effect
proportionally rather than manufacturing a red test. Instruction behavior needs
real agent execution; packaging checks alone do not prove it. Bind verification
to checked input/output bytes; changed evidence inputs require rechecking.

## References

- [commands](../../references/commands.md#workflow): before recording accepted basis or workflow progress.
- [planning](../../references/planning.md): when selecting among dependent implementation tasks.
- [testing](../../references/testing.md): before choosing a behavior test boundary or handling blocked/agent/browser checks.
