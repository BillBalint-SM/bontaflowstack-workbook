---
name: design-review
description: "Inspect a real interface for visual and interaction problems, optionally repair requested issues, and verify the affected output."
---

# Rendered design review

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `inspect`, `fix`. Choose the mode from the actual request.

1. Identify the page, target viewports, relevant design system and requested inspection or repair scope.
2. Use the shared browser capability to inspect the actual page, screenshots, console and interactions. Review the screenshots you capture.
3. Check hierarchy, typography, spacing, layout, content, visual consistency, responsive states and accessibility. Ground findings in observable effects on the intended task.
4. Record defects using the shared findings reference, including reproduction, expected result, observed result and evidence. Keep taste suggestions separate.
5. In fix mode, trace each verified defect to its source, preserve unrelated edits and make the narrow correction. Re-render or repeat the interaction that exposed it.
6. Return tested scope, before/after evidence, remaining findings and actual changes. A missing browser or login blocks the affected check rather than proving the UI correct.

Use design-consultation when the user needs a new direction, or design-html for a requested implementation. A plan-only UI question belongs to plan-design-review.

## References

- [commands](../../references/commands.md)
- [findings](../../references/findings.md)
- [browser](../../references/browser.md)
