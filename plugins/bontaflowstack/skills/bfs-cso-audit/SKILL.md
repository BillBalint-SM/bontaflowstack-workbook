---
name: bfs-cso-audit
description: "Audit code or a change for reachable security risks and prioritized remediation."
---

# BFS CSO Audit

Load [HOST.md](../../HOST.md) via `read bfs-cso-audit`; follow its hash-based read protocol.
Mode: `audit`.

1. Establish the authorized codebase, change and audit depth. Identify assets, external inputs, privileges, data stores and sensitive operations.
2. Map input validation, authentication, authorization, tenant boundaries, secret handling, dependency exposure, command execution and data egress where present.
3. Trace suspicious paths to real callers and controls. Use existing local checks or a bounded non-destructive reproduction when appropriate.
4. Describe exploit prerequisites, observed behavior and impact. Treat an unverified pattern match as a hypothesis; do not expose real credentials in reports.
5. Prioritize fixes by demonstrated consequence and reachability. Give a concrete remediation and a test that would show the boundary is repaired.
6. Pass a requested repair to bfs-bug-issue-investigate with the relevant evidence.

An audit does not authorize intrusive activity against external systems. Existing project protections and user data must be preserved.

Output: Audited coverage, demonstrated findings, mitigations and untested surfaces.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [review](../../references/review.md): when applying relevant review perspectives.
