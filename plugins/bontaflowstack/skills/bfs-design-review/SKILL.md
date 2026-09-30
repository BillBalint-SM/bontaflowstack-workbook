---
name: bfs-design-review
description: "Inspect a rendered interface for usability and visual defects, or repair and retest requested findings."
---

# BFS Design Review

Load [HOST.md](../../HOST.md) via `read bfs-design-review`; follow its hash-based read protocol.
Modes: `inspect`, `fix`. Use inspect for findings and fix only for requested repairs. Default: `inspect`.

1. Identify the page, target viewports, relevant design system and requested inspection or repair scope.
2. Use the shared browser capability to inspect the actual page, screenshots, console and interactions. Review the screenshots you capture. Missing browser/login blocks the affected check.
3. Check hierarchy, typography, spacing, layout, content, visual consistency, responsive states and accessibility. Ground findings in observable effects on the intended task.
4. Record defects using the shared findings reference, including reproduction, expected result, observed result and evidence. Keep taste suggestions separate.
5. In fix mode, trace each verified defect to its source, preserve unrelated edits and make the narrow correction. Re-render or repeat the interaction that exposed it.

Use bfs-design-consultation when the user needs a new direction, or bfs-design-html for a requested implementation. A plan-only UI question belongs to bfs-plan-design-review.

Output: Tested scope, findings, actual changes and before/after evidence.

## References

- [capabilities](../../references/capabilities.md): before checking or using optional engines/image/design tools.
- [commands](../../references/commands.md): when constructing a core request.
- [findings](../../references/findings.md): when recording reproducible findings and retest evidence.
- [browser](../../references/browser.md): before browsing, login, rendering or web measurements.
