---
name: bfs-qa
description: "Test actual web interactions and responsive behavior, report reproducible defects, and optionally fix requested issues and retest them."
---

# BFS QA

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `inspect`, `fix`, `quick`, `full`, `regression`, `diff`. Choose the mode from the actual request.

1. Select inspect or fix according to the request; inspect is the default. Choose quick, full, diff-aware or named-baseline regression coverage within that mode.
2. Establish the URL, user journey, test data and allowed interactions. Use the shared browser reference for login and fresh element snapshots.
3. Execute the scoped flow and relevant normal, empty, error and success states. Inspect page content, console, links, responsive layout, keyboard operation and screenshots.
4. Record actual failures using the shared findings reference: reproduction, expected/observed behavior, URL, viewport, evidence and consequence. Separate environment failures from product defects.
5. In fix mode, trace confirmed findings through source and callers. Keep baseline evidence, make the authorized repair, and add a discriminating regression where useful.
6. Re-run the failing interaction and affected checks. Preserve original failures and label deferred or unverified results.
7. Check the report against actual evidence and return tested scope, findings and changes. Inspect mode leaves application source and tests unchanged.

Report files may be written to the agreed destination. Health scoring is optional: define the assessed categories and rubric, exclude untested categories, and compare only equivalent coverage.

## References

- [commands](../../references/commands.md)
- [findings](../../references/findings.md)
- [browser](../../references/browser.md)
