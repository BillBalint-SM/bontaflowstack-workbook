# Observable test boundaries

Map each affected requirement to precondition, operation, expected result and its
source. Choose the narrowest existing public boundary that exposes that result:
exported function for pure behavior, API request/response for a service contract,
CLI arguments/stdin plus stdout/stderr/exit code, or a rendered user interaction.
Include affected failure and recovery paths. Keep the expectation independent of
the implementation; private call sequences are not the user's outcome.

Reuse a valid existing test boundary. Explain a change to it using the observable
gap it closes. Use real local implementations where practical; isolate external
side effects with a clearly identified fake. A fake proves only its checked scope.
Missing services, credentials, dependencies, import errors and broken test commands
are environment/setup failures, not proof that the intended behavior fails.

For visual or browser behavior retain actual rendered evidence; a source assertion
alone cannot establish it. For skill instructions retain real agent transcripts,
questions, reads, tool results and file/state changes; text checks establish only
packaging. Run matched fresh sessions for repeatability where the accepted plan
requires them. Required unavailable checks stay blocked with a concrete next step.

The red/green/refactor execution procedure belongs to
[bfs-implement](../skills/bfs-implement/SKILL.md#tdd); use it for behavior changes.
