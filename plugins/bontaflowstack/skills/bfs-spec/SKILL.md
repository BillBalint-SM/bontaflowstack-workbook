---
name: bfs-spec
description: "Draft or revise a project-grounded specification with observable acceptance scenarios."
---

# BFS Spec

Load [HOST.md](../../HOST.md) via `read bfs-spec`; follow its hash-based read protocol.
Modes: `draft`, `revise`. Use draft for a new spec and revise for changes to an existing spec. Default: `draft`.

1. Read the request, brief, relevant source and existing interfaces. Identify the intended user outcome and the concrete output being specified.
2. Define normal behavior, boundary cases, failure recovery, affected data and external dependencies. Resolve behavior-changing domain collisions through the discovery reference and the project's existing domain source. Distinguish required behavior from examples and optional ideas.
3. Resolve product choices with the user; choose routine implementation details using the project's conventions. Record assumptions and their impact.
4. Write the specification defined in Output, proportional to the change.
5. Trace every explicit request to a requirement, its actual source and an acceptance case with precondition, operation, expected result and public test boundary. Read testing when selecting that boundary; reuse valid existing seams. State the exact missing input for any unresolved requirement.
6. Read the final specification for contradictory requirements and unusable placeholders. Pass it to bfs-autoplan or an individual plan review when requested.

Draft locally by default. Creating an issue is a separate requested publication using the project's tracker instructions.
When implementation is requested, pass the concrete specification and its user acceptance source to bfs-implement. Its accepted-basis rules govern the transition.

Output: Specification covering scope, journeys, interfaces, acceptance scenarios, implementation order and relevant migration, recovery and rollback needs.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [discovery](../../references/discovery.md): for dependent product choices or ambiguous domain terms.
- [testing](../../references/testing.md): when mapping acceptance cases to observable test boundaries.
