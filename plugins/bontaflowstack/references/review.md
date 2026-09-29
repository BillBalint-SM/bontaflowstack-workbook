# Review perspectives

Trace the real operation from caller input to its returned result and side
effects. Inspect whole definitions and relevant callers when a diff changes
their contract. Review only applicable areas:

- Correctness: boundary values, null/empty input, state transitions, stale data.
- Data: ownership, concurrent updates, migration, rollback and partial failure.
- Security: validation at trust boundaries, authorization, tenant isolation,
  secrets, process arguments, file paths and external data handling.
- API: compatibility, request/response shape, documented errors and retries.
- Performance: actual input sizes, repeated queries, unnecessary I/O and bounds.
- Tests: a meaningful failing case for the behavior, real result assertions.
- Maintenance: understandable responsibility, existing facilities, removable
  duplication and unjustified dependencies.
- UI: rendered content, navigation, states, responsive layout and accessibility.

Every reported defect needs a triggering input, reachable path and consequence.
Keep an uncertain hypothesis labelled. Avoid declaring an entire system safe
or correct from a narrow check.
