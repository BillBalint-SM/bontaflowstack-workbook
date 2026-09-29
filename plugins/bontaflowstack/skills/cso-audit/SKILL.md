---
name: cso-audit
description: "Audit a codebase or change for demonstrated security risks, trust-boundary failures and prioritized remediation."
---

# Security audit

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `audit`. Choose the mode from the actual request.

1. Establish the authorized codebase, change and audit depth. Identify assets, external inputs, privileges, data stores and sensitive operations.
2. Map input validation, authentication, authorization, tenant boundaries, secret handling, dependency exposure, command execution and data egress where present.
3. Trace suspicious paths to real callers and controls. Use existing local checks or a bounded non-destructive reproduction when appropriate.
4. Describe exploit prerequisites, observed behavior and impact. Treat an unverified pattern match as a hypothesis; do not expose real credentials in reports.
5. Prioritize fixes by demonstrated consequence and reachability. Give a concrete remediation and a test that would show the boundary is repaired.
6. Report audited coverage, findings, mitigations and untested surfaces. Pass a requested repair to bug-issue-investigate with the relevant evidence.

An audit does not authorize intrusive activity against external systems. Existing project protections and user data must be preserved.

## References

- [commands](../../references/commands.md)
- [review](../../references/review.md)
