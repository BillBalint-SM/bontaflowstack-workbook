# Roadmap execution — 0.7.0

Accepted basis: [plan](../../tasks/plan.md) and
[test plan](../../tasks/test-plan.md), accepted by the actual user in the current
chat. The original acceptance documents are preserved.

## Delivered scope

- Context/closure was released and installed as 0.6.1 at
  `8baab4dedfce880135ce40594a257508a1e38780`; 52 checks and archive smoke passed.
- Prototype adds an isolated runnable decision experiment and keeps observation,
  recommendation and actual user selection separate. Its two native cases passed;
  the comparison is a modeled fixture, not measured user satisfaction.
- Requested parallel implementation adds a dependency graph, isolated worker
  ownership, declared write scopes and actual Git/check evidence before integration.
  Overlap serializes; ordinary implementation remains a single-workflow TDD flow.
- Triage, wayfinding and learning are independent skills, with no new mandatory
  interview or phase. The public catalog contains 34 skills.

The task engine and CLI use the existing standard-library state, workflow and
delivery modules. No runtime dependency, automatic worker scheduler or merge
executor was introduced.

## Evidence

| Scope | Observed result | Detail |
|---|---|---|
| Prototype | Two native cases passed; source project unchanged | [Report](PROTOTYPE-REPORT.md) |
| Context and old manual cases | C01-1–3 and M01–M04 passed; initial ambiguous M01 timeout retained, corrected CLI-entry fixture finished in 56.421 s | [Report](REMAINING-ACCEPTANCE-REPORT.md) |
| Guard | Actual PreToolUse allows/denies, one-shot permission, safe root hard-deny and new-task/workspace isolation observed | [Report](GUARD-NATIVE-REPORT.md) |
| Task graph | 6/6 focused checks, including Windows CRLF, dirty tracked input and path identity regression | [Report](PARALLEL-IMPLEMENTATION-REPORT.md) |
| Git integration | 6/6 real-worktree checks and two native workers passed; serial integration unlocked D and its real combined check passed | [Report](PARALLEL-IMPLEMENTATION-REPORT.md) |
| Standalone skills | Triage and practice/preserve cases passed; wayfinder and review finished by resuming their original saved chats | [Report](STANDALONE-EXTENSIONS-REPORT.md) |
| Routing | Seven exact catalog resolutions and one native seven-request advice case passed; no workflow/state writes | Native task `01a0f798-c97b-76d3-a001-d5a104cc1a52`, exit 0, 37.264 s |

Initial native timeouts remain UNVERIFIED in history. Completed continuation
segments supply separate evidence and do not replay prior checks or writes.
The two E continuations changed model; the learning review uses its original
successful memory readback because a fresh continuation lookup was blocked.
These limits are recorded rather than claiming an unchanged-model experiment
or a fresh lookup. No stale historical workflow is closed merely because its
underlying source work was delivered.

The two original blocked workflows `c2cf4074-c3b4-4501-bee7-51b4b56d0307`
and `e340a007-7cec-4ce0-a8ba-febd74bc1106` were explicitly adopted in their
same workspace, rechecked against the now-complete applicable V evidence and
closed. Their previous steps remain in history. Unavailable native Edit/Write
surfaces have no separate certification; the available apply_patch path was tested.

## Standards review

Reviewer: primary implementation agent, source review of this accepted scope.
Existing CLI JSON/error boundaries, atomic project state, workspace/task ownership
and delivery evidence are reused. Writes validate IDs, normalized paths, graph
dependencies, provenance and actual Git scope. Test fixtures preserve other
branches and user files. Windows line endings use Git semantics for tracked
inputs; uncommitted input changes still invalidate freshness.

The native cross-worktree case exposed and resolved path spelling, Git ownership
and shared metadata access boundaries. Only exact owned fixture paths were
allowed in worker-process Git configuration; no global config, ACL or hook trust
was changed. Automated full-package and archive results belong to the final
release assets. This review does not certify unavailable native tool surfaces.

## Spec review

The implementation covers requested optional prototype, task graph and standalone
skill behavior without adding them to every ordinary journey. Evidence above
distinguishes completed implementation from remaining native acceptance limits.
Applicable native assertions are evidenced in the linked reports, including the
saved continuations. Unavailable tool surfaces and environment/model limits stay
explicit; no accepted point is silently dropped.

Release revision, archive hashes, the single final package check and extracted
archive smoke are recorded with the release assets. Installation is verified
against that exact revision, including skill agent metadata; independent global
agent TOML files are outside this plugin's installation contract.
