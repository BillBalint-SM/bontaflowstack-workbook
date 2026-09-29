---
name: finisher
description: "Prepare a verified change for delivery, review and documentation, then carry out the requested commit, push and pull-request operations."
---

# Finish and deliver a change

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `prepare`, `publish`. Choose the mode from the actual request.

1. Identify the repository, branch, actual base and intended delivery result. Inspect current edits and keep ownership of unrelated changes explicit.
2. Map the change to the requested behavior. Run the project's relevant existing checks and preserve real failures.
3. Execute review or reuse a review bound to the same unchanged inputs. Resolve substantive findings within the requested repair scope and repeat affected checks.
4. Use documentation for requested documentation work; review the resulting files with the implementation. Follow the project's version and changelog policy when release changes are requested.
5. Use landing-report for selected live queue/version information. A local version calculation is not a reservation or proof that no competing release exists.
6. Before publishing, recheck the target, current content and relevant evidence. Inspect changes for accidental credentials and stage only the intended files.
7. Perform the requested commit, normal push and PR create/update operations using the repository's conventions and actual host tools. Preserve multiline descriptions and report actual links.
8. Return preparation, commit, push and PR outcomes separately. A requested integration/deployment continues with prod-deploy and the exact verified change.

Local preparation can finish without publication. Existing review and test results become stale when their relevant inputs change.

## References

- [commands](../../references/commands.md)
