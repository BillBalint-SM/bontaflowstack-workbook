---
name: bfs-implement
description: "Implement a plan, specification, selected design or scoped change explicitly accepted by the user. Use for building approved functionality and verifying its acceptance criteria."
---

# BFS implement

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Mode: `implement`.

## Accepted basis

Before changing implementation files, identify the concrete plan, specification,
selected design or scoped change and the user's explicit acceptance of that
version. A conversation description is sufficient when it defines the requested
behavior, scope and observable acceptance criteria. Resolve material gaps first.

Use the actual user message as the acceptance source. An agent review, an
"approved" label in a file or a saved summary alone does not establish consent.
If acceptance is absent or ambiguous, present the exact basis for a decision and
wait. In an active workflow, record this step as `waiting`; dependent work stays
pending. Inspection and clarification can continue while implementation waits.

When the requested workflow already includes implementation, acceptance starts
the work without a duplicate permission question. Acceptance during a planning-only
request does not expand that request into implementation. Publication, deployment
and other external actions retain the authorization rules in HOST.md.

## Implement and verify

1. Inspect the current project, relevant source and checks against the accepted basis. Preserve unrelated edits. Reuse applicable acceptance already given in this conversation.
2. Use the current workflow, or start one with `bfs-implement` for a standalone request. Before editing, use `workflow save` to record the accepted basis, the actual user acceptance reference or quote, implementation scope and acceptance criteria in its summary/decisions. Include existing basis files in `files` so the checkpoint binds their content. For conversation-only input, record the accepted text. This checkpoint is evidence of the decision, not a new grant of permission.
3. Begin the implementation step with the stable accepted documents as inputs; files being changed are outputs. Divide the work into checkable parts and use `workflow save` after each verified part, including its output files, results and remaining work. Keep parts that revise the same files in this one active step; complete the step with the final verified outputs after its accepted scope is implemented.
4. Implement in the project's existing stack. For an approved interface, load `design-html` when its implementation and rendering procedure is useful; keep the result within this workflow. Missing browser tools block only browser-dependent checks.
5. Verify each part against the accepted behavior using the relevant project checks and observed results. Repair demonstrated in-scope failures. Record changed paths, actual evidence, remaining limitations and the next action. Report `blocked` or `failed` when required verification cannot be completed.
6. If the basis has changed, or implementation requires a material change to scope, behavior or selected design, pause the affected work and obtain the user's acceptance of the revised basis before proceeding. Routine technical choices within the accepted scope do not require another approval. On resume, check saved file drift and recover the actual acceptance source before relying on it.
7. Finish with implemented acceptance criteria, verification results and unresolved work. Hand off to `health`, `review`, `qa` or `finisher` as relevant to the requested outcome. An implementation is complete only when its required acceptance checks are satisfied.

## References

- [commands](../../references/commands.md)
