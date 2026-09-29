---
name: plan-devex-review
description: "Review planned API, CLI, SDK, onboarding and error-recovery experiences. Use for developer-facing designs before implementation."
---

# Developer interface plan review

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `review`. Choose the mode from the actual request.

1. Identify the intended developer, first successful task, supported environments and exposed interfaces.
2. Walk installation, configuration, authentication, first use, ordinary errors and recovery from the proposed instructions.
3. Check naming, defaults, output formats, actionable diagnostics, compatibility and the amount of knowledge required before first success.
4. Examine examples, documentation discovery and whether credentials or platform prerequisites are explained at the point they are needed.
5. Turn each problem into a concrete interface or documentation change and an acceptance scenario.
6. Return findings with the distinction between planned targets and measured experience. This skill finishes at plan review; it does not route to a removed runtime audit.

## References

- [commands](../../references/commands.md)
