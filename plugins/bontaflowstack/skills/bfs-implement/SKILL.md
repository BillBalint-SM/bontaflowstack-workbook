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
3. Begin with stable accepted documents as inputs and changed files as outputs. Implement checkable parts in the existing stack; save verified progress, output files, evidence and remaining work. Keep revisions of the same files in one active step, completed with final verified outputs.
4. For accepted UI work, use bfs-design-html when its implementation/rendering procedure applies, within this workflow. Missing browser capability blocks only browser checks.
5. Verify each part against accepted behavior using relevant checks and observed results; repair demonstrated in-scope failures. Record changed paths, evidence, limitations and next action. Required verification that cannot finish leaves the step blocked or failed.
6. If the basis changes or work requires material scope/behavior/design revision, record `waiting`, present the revision and obtain acceptance before proceeding. On resume, check drift and recover the actual acceptance source.
7. Use bfs-health, bfs-review, bfs-qa or bfs-finisher for the requested outcome. Complete only after required acceptance checks pass.

Output: Implemented acceptance criteria, verification evidence, changed paths and unresolved work.

## References

- [commands](../../references/commands.md#workflow): before recording accepted basis or workflow progress.
