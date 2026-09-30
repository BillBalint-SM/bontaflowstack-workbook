---
name: bfs-qa
description: "Test real web journeys and responsive states, or fix and retest requested defects."
---

# BFS QA

Load [HOST.md](../../HOST.md) via `read bfs-qa`; follow its hash-based read protocol.
Modes: `inspect` for testing, `fix` for requested repairs. Save mode and coverage independently; default inspect/quick.

1. Select coverage: quick tests the named main journey/immediate failures; full adds relevant normal, empty, error, success, responsive and keyboard states within that area. Regression requires a named baseline; diff requires a comparison base. Ask for missing bases before comparing. Legacy coverage-as-mode requests mean inspect plus that coverage.
2. Establish URL, journey, test data and allowed interactions; ask for missing inputs before browser readiness checks. Follow browser rules for login and fresh snapshots.
3. Execute scoped states; inspect content, console, links, responsive layout, keyboard behavior and screenshots.
4. Record actual failures using findings: reproduction, expected/observed behavior, URL, viewport, evidence and consequence. Separate environment failures from product defects.
5. In fix mode, trace confirmed defects through source/callers, preserve baseline evidence and make authorized repairs with discriminating regressions where useful.
6. Repeat failing interactions and affected checks. Preserve original failures; label deferred/unverified results and check the report against evidence. Inspect leaves application source/tests unchanged.

Write reports to the agreed destination. Optional health scoring follows findings' rubric/coverage rules, excluding untested categories and comparing equivalent coverage.

Output: Tested scope, reproducible findings, requested repairs, retest evidence and unverified results.

## References

- [capabilities](../../references/capabilities.md): before checking or using optional engines.
- [commands](../../references/commands.md): when constructing a core request.
- [findings](../../references/findings.md): before recording defects/retests or scoring health.
- [browser](../../references/browser.md): before browser work.
