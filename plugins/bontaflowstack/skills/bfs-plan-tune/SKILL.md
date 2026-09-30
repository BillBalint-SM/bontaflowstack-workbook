---
name: bfs-plan-tune
description: "Inspect or configure optional BFS preferences, including panel/chat questions, and review adjustment proposals."
---

# BFS Plan Tune

Load [HOST.md](../../HOST.md) via `read bfs-plan-tune`; follow its hash-based read protocol.
Modes: `inspect` for preferences/history, `configure` for requested changes, `proposals` for adjustments. Default: `inspect`.

1. Identify operation and user/project/task scope. Read preferences inspect/effective; distinguish absent data from malformed state.
2. Set an eligible preference with ID, actual question, distinct options and chosen value; reset its exact ID. Read back changes and refresh effective preferences; choices remain advisory.
   For `question-presentation`, use both canonical options `prefer-panel` and `chat`. Set/reset defaults to user scope; honor explicit project/task overrides. Inspect reports effective value/scope or unsaved `prefer-panel`; reset restores inheritance. A precise mode request needs no duplicate question. Follow HOST presentation rules.
3. Use preferences profile for explicitly supplied 0..1 values: scope_appetite, risk_tolerance, detail_preference, autonomy, architecture_care. Preserve other fields.
4. Enable/disable project question recording only on request. Record eligible actual optional questions with preferences question; exclude credentials and authorization questions.
5. For requested review, read stats/observations; compare declared choices with the sample and report its size. Create proposals with a source quotation and affected scope. Apply only a user-selected proposal; verify changed preference/profile/memory and proposal status, then refresh effective preferences.

Route project decisions/learnings to bfs-bontaflow-memory. Inference does not establish identity, consent or authorization.

Output: Observed/changed preferences, scope, effective values and applicable proposal status.

## References

- [commands](../../references/commands.md#preferences): before constructing preference requests or choosing eligible IDs/JSON shapes.
