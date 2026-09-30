---
name: bfs-benchmark
description: "Measure page performance, capture comparable baselines, and report regressions or trends from real browser samples."
---

# BFS Benchmark

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `quick`, `baseline`, `compare`, `trend`. Choose the mode from the actual request.

1. Select the pages and measurement mode. Quick uses one labelled sample; a baseline or comparison uses three samples under equivalent conditions.
2. Record browser, viewport, cache, network, authentication and revision when known. Diff-aware coverage comes from an explicit base and verified changed pages.
3. Read real navigation, paint and resource entries through engine browser perf or js. Serialize entries with toJSON when needed.
4. Calculate TTFB from responseStart minus requestStart; retain interactive/load timings, FCP, request counts and observable transfer sizes. Measure LCP with a buffered PerformanceObserver and a bounded wait. Missing measurements remain unknown.
5. Report medians for repeated samples and compare only matching coverage and conditions. A zero baseline produces an unavailable percentage, not infinity. Apply user budgets first; otherwise label a suggested threshold as a heuristic.
6. Save raw samples and a report to the agreed project directory. Only an explicit baseline operation replaces the selected baseline, preserving its previous copy.
7. Check calculations against samples and report slow resources, verified regressions and hypotheses needing investigation.

A local browser measurement is not field Core Web Vitals evidence. Trend mode reads compatible stored measurements without starting a browser or modifying the application.

## References

- [commands](../../references/commands.md)
- [browser](../../references/browser.md)
