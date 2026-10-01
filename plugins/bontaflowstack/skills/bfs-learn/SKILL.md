---
name: bfs-learn
description: "Create an isolated runnable practice exercise or review its actual learning evidence."
---

# BFS Learn

Load [HOST.md](../../HOST.md) via `read bfs-learn`; follow its hash-based read protocol.
Modes: `practice`, `review`. Default: `practice`. Execute only the requested mode.

## Practice

1. Use the user's stated learning goal. If it is missing or too broad to select a concrete exercise, ask one question that determines the exercise.
2. Choose a new, empty, clearly named practice directory outside the source project's working files. Inspect the destination first. Never overwrite or adopt an existing user file; if the exact destination is occupied, stop and ask for another path.
3. Create only the minimum runnable exercise: a short task, starter file when useful, one executable check and a README with the run command. Use synthetic data; copy no secrets, credentials, production data or source-project files.
4. Run the check against the starter state when that demonstrates the exercise. Report its observed result and what the learner should change. A broken starter check is expected only when the exercise explicitly teaches fixing a failing behavior.

## Review

1. Inspect the requested exercise, the learner's actual changed files and the exact check. Run the check when safe and available; otherwise report why evidence is missing.
2. Map each stated learning objective to observed evidence. Distinguish passing check, partial understanding and unverified claims. A practice result never completes the product task or its workflow.
3. Suggest one next exercise based on an observed gap. Save a reusable learning only when explicitly requested, using the current project's `memory put` with `kind: learning`, observed/inferred provenance, actual `sourceRef`, relevant files and expected revision when updating. Read it back. Do not modify global rules or other projects.

Output: Practice path and executable check, or objective-by-objective review grounded in actual results; include any explicitly requested learning record ID.

## References

- [Learning workspace contract](../../references/learning.md).
- [Project learning lifecycle](../../references/commands.md#memory).
