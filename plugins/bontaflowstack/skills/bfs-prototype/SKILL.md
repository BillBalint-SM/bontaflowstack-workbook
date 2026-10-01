---
name: bfs-prototype
description: "Run a small, disposable experiment to settle a concrete product or technical question and preserve the decision evidence."
---

# BFS Prototype

Load [HOST.md](../../HOST.md) via `read bfs-prototype`; follow its hash-based read protocol.
Mode: `explore`.

Use this skill when a runnable experiment can resolve a decision before production work. A prototype is an experiment, never an accepted production change.

1. **Frame one question.** State the user or engineering decision, the uncertain assumption, and a falsifiable hypothesis. Name the observation that would distinguish the options. Reuse known project facts and user decisions; ask only if an unresolved choice changes the experiment.
2. **Choose the smallest runnable probe.** Prefer the existing stack and a single command or standalone HTML file. Exercise the disputed behavior directly. Keep only enough interface or logic to make the observation visible. Avoid persistence, dependencies, production imports and unrelated polish.
3. **Isolate it.** Place generated artifacts in an explicitly named disposable directory outside production source. Mark them `PROTOTYPE — disposable`. Keep inputs, command, expected observation and actual output together. Do not change production code, settings, hooks, dependencies or external state to make the experiment run.
4. **Run and compare.** Execute the probe and record its actual command, exit status, relevant output and input identity. Compare the observation with the hypothesis. A blocked or non-discriminating run is inconclusive; do not turn it into a recommendation by assertion.
5. **Preserve provenance.** Report the question, alternatives, hypothesis, probe, evidence, result, limits and the decision still needed. If the user actually selects an option during authorized project work, preserve that selection and source with the existing workflow decision or project memory procedure. An experiment result alone is not user acceptance. Do not commit the disposable artifact to `main`, create an issue, or publish it. If the user asks to retain it, use an isolated prototype branch and keep a pointer to that artifact with the decision.
6. **Hand off only after selection.** A selected direction may go to `bfs-spec` or `bfs-design-consultation`; implementation requires the applicable accepted basis and `bfs-implement` flow. Keep rejected and inconclusive options in the experiment report, not active project plans.

Output: Runnable disposable probe, actual evidence, bounded conclusion and decision provenance or the exact unresolved choice.

## References

- [prototype procedure](../../references/prototype.md): artifact and evidence contract.
- [commands](../../references/commands.md#workflow): when saving an authorized project decision or workflow step.
- [context](../../references/context.md): when the user requests a portable handoff.
