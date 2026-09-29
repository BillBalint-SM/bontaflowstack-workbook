---
name: plan-tune
description: "Inspect or change optional question preferences and declared profile values, review local question history, and propose or apply scoped adjustments."
---

# Question preferences

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `inspect`, `configure`, `proposals`. Choose the mode from the actual request.

1. Identify the requested operation and scope: user, project or current task. Use preferences inspect/effective for reads; report missing data as empty and malformed data as an error.
2. For a precise optional question, use preferences set with its eligible ID, question, distinct options and chosen value; use reset for that exact preference. Saved choices remain advisory.
3. Profile changes use preferences profile with explicitly supplied values from 0 to 1 for scope_appetite, risk_tolerance, detail_preference, autonomy or architecture_care. Preserve fields the user did not change.
4. Enable or disable project question recording with preferences enable only when requested. Record eligible, actual optional questions with preferences question; never record credentials or authorization questions.
5. For a requested review, read preferences stats and its observations. Compare declared choices with the actual sample and state its size. Create proposals with preferences propose, preserving a source quotation and affected scope.
6. Apply a selected proposal with preferences apply only after the user chooses it. Verify the resulting preference, profile or memory record and proposal status.
7. Return exactly what changed and its scope. Route general project decisions and learning work to bontaflow-memory.

See the common command reference for the eligible question IDs and JSON shapes. Automatic inference is not user identity, consent, or permission to act.

## References

- [commands](../../references/commands.md)
