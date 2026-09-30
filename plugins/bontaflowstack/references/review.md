# Review axes

For code review freeze the selected base and target first: resolved commits for
a committed diff (use the intended merge-base/three-dot scope), or the actual file
pair and content hashes for working-tree changes. Both axes inspect that same
scope. Include requirement sources, exclusions and relevant project rules. Recheck
changed inputs; an earlier result does not certify different bytes or requirements.

## Standards

Evaluate the repository's applicable documented rules and reachable correctness,
data, security and maintenance risks. Cite the rule source or demonstrated failure;
a style preference alone is not a defect. Trace caller input to results and side
effects, reading whole definitions and relevant callers. Apply relevant perspectives
below even when no style guide exists; a narrow check cannot certify the system.

## Spec

Resolve the actual user requirement and acceptance cases from the specified document
or concrete conversation. Compare every in-scope behavior, affected error/recovery
path, exclusion and compatibility promise with the implementation and evidence.
Report omitted requirements even when Standards passes. A missing requirement source
is BLOCKED, not a pass; a saved approval label alone is not that source.

## Results and independent review

Report Standards and Spec separately as PASS, FAIL, BLOCKED or NOT-APPLICABLE, with
scope and evidence. PASS means the checked scope has no demonstrated defect; FAIL
needs a supported defect; BLOCKED identifies missing input/capability. Give a reason
for NOT-APPLICABLE. Each finding carries axis, priority, location, trigger/call path,
impact, evidence and practical fix. Label hypotheses separately from defects.

Default execution is two analytical passes in the current agent. When independent
review is requested and host/project delegation rules permit it, give separate
reviewers the same frozen base/target, requirements and rules, assigning one axis
to each. Inspect their actual results and reconcile conflicts by evidence. Record
reviewer identities and input hashes. If separate reviewers are unavailable, report
that check blocked; two passes by one agent are not independent reviewers.

## Relevant perspectives

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

Retain verification limits beside the axis result.
