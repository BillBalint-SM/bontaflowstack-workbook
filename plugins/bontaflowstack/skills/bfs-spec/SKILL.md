---
name: bfs-spec
description: "Turn an agreed request into a specification with behavior, scope, acceptance cases and implementation steps grounded in the actual project."
---

# BFS Spec

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `draft`, `revise`. Choose the mode from the actual request.

1. Read the request, brief, relevant source and existing interfaces. Identify the intended user outcome and the concrete output being specified.
2. Define normal behavior, boundary cases, failure recovery, affected data and external dependencies. Distinguish required behavior from examples and optional ideas.
3. Resolve product choices with the user; choose routine implementation details using the project's conventions. Record assumptions and their impact.
4. Write scope, user journeys, interfaces, acceptance scenarios, implementation order, migration needs and rollback considerations proportional to the change.
5. Trace every explicit request to a requirement and an observable acceptance result. State the exact missing input for any unresolved requirement.
6. Read the final specification for contradictory requirements and unusable placeholders. Pass it to bfs-autoplan or an individual plan review when requested.

Draft locally by default. Creating an issue is a separate requested publication using the project's tracker instructions.
When implementation is requested, pass the concrete specification and its user acceptance source to bfs-implement. Its accepted-basis rules govern the transition.

## References

- [commands](../../references/commands.md)
