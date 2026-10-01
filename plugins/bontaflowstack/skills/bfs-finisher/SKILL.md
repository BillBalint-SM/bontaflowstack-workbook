---
name: bfs-finisher
description: "Prepare a verified change for delivery or perform requested commit, push and PR operations."
---

# BFS Finisher

Load [HOST.md](../../HOST.md) via `read bfs-finisher`; follow its hash-based read protocol.
Modes: `prepare`, `publish`. Use prepare for local readiness and publish for requested commit/push/PR work. Default: `prepare`.

1. Identify the repository, branch, actual base and intended delivery result. Inspect current edits and keep ownership of unrelated changes explicit.
2. Map the change to the requested behavior. Run the project's relevant existing checks and preserve real failures.
3. Execute bfs-review or reuse a review bound to the same unchanged inputs. Resolve substantive findings within the requested repair scope and repeat affected checks.
4. Use bfs-documentation for requested documentation work; review the resulting files with the implementation. Follow the project's version and changelog policy when release changes are requested.
5. Use bfs-landing-report for selected live queue/version information. A local version calculation is not a reservation or proof that no competing release exists.
6. Before publishing, recheck the target, current content and relevant evidence. Inspect changes for accidental credentials and stage only the intended files.
7. Perform the requested commit, normal push and PR create/update operations using the repository's conventions and actual host tools. Preserve multiline descriptions and report actual links.
8. Record the observed requested stages through delivery evidence/report under the owned workflow and exact subject in [delivery](../../references/delivery.md). Local prepare can close with publish/integrate/deploy not requested. If saving failed after an external operation, query its real state before any retry.
9. Offer bfs-retro when requested or a consequential failure/recovery left a reusable lesson. Routine successful closure finishes directly; a retro is optional.

Local preparation can finish without publication. Existing review and test results become stale when their relevant inputs change.

Output: Preparation, commit, push and PR outcomes with links; hand requested integration/deployment to bfs-prod-deploy.

## References

- [delivery](../../references/delivery.md): before delivery-readiness, commit/PR, integration or deployment work.
- [commands](../../references/commands.md#delivery): before constructing delivery requests.
