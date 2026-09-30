# BFS skill editing validation report

Date: 2026-09-30. Scope: source plugin, all 29 skills, HOST, conditional references,
catalog descriptions and existing package validation. Language remains English.

## Result

All skills use the same skill-specific HOST read instruction. Single modes have
no selection boilerplate; multiple modes describe concrete triggers and catalog
defaults. QA keeps action and coverage separate. Each skill has an Output
requirement; operational checks remain next to the relevant action.

HOST defines accepted basis, checkpoint, evidence and waiting, and retains the
hash protocol, scope/authorization, effective question preferences, workflow and
state safeguards. Optional capabilities, guard procedures and delivery checks
are conditional references. Their loading conditions remain directly in HOST.
Browser-script removal has one shared section linked by router, browse and scrape.

Catalog comparison with the pre-edit snapshot is identical after excluding
skill descriptions: IDs, modes, defaults, capability declarations, handoffs,
aliases, removed-alias diagnostics and workflow routes are unchanged. Descriptions
match SKILL frontmatter. Picker short descriptions and invocation policies retain
their meaning and were not changed. The existing uncommitted panel/chat work
was preserved.

Review and findings references were reviewed and retained: they already provide
short, specific operational criteria. Commands retain concrete syntax and
validation details; the prior preference additions remain intact.

## Word counts

Counts use whitespace-separated words. Skill body excludes YAML frontmatter but
includes headings, links and Output. Description counts exclude YAML syntax.
The before snapshot was taken from the working tree, including the existing
uncommitted question-presentation changes, rather than Git HEAD.

| Instruction area | Before | After | Change |
|---|---:|---:|---:|
| 29 skill bodies | 7465 | 6195 | -1270 |
| 29 descriptions | 550 | 356 | -194 |
| HOST | 1345 | 1142 | -203 |
| All references | 1767 | 2178 | +411 |
| Combined instruction text | 11127 | 9871 | -1256 (11.3% shorter) |

New reference text: capabilities 133, guard
163, delivery 107 words; total
403. These contain moved rules, linking
instructions and some retained detail from skills. They are included in the
after reference total; HOST reduction alone is not counted as total savings.
Some bodies grew because explicit mode triggers and reference conditions replaced
ambiguous boilerplate. No percentage target or token-cost claim was applied.

| Skill | Body before → after | Description before → after |
|---|---:|---:|
| bfs-router | 867 → 479 | 29 → 14 |
| bfs-implement | 617 → 331 | 24 → 14 |
| bfs-business-builder | 240 → 243 | 23 → 12 |
| bfs-spec | 204 → 213 | 20 → 10 |
| bfs-autoplan | 233 → 214 | 18 → 12 |
| bfs-plan-ceo-review | 147 → 132 | 21 → 11 |
| bfs-plan-eng-review | 153 → 137 | 16 → 12 |
| bfs-plan-design-review | 160 → 137 | 15 → 12 |
| bfs-plan-devex-review | 149 → 124 | 15 → 11 |
| bfs-plan-tune | 356 → 224 | 20 → 13 |
| bfs-design-consultation | 358 → 259 | 22 → 13 |
| bfs-design-html | 241 → 256 | 20 → 13 |
| bfs-design-review | 198 → 206 | 18 → 15 |
| bfs-browse | 231 → 243 | 21 → 15 |
| bfs-scrape | 215 → 220 | 22 → 13 |
| bfs-benchmark | 239 → 264 | 15 → 10 |
| bfs-bug-issue-investigate | 209 → 207 | 18 → 13 |
| bfs-review | 224 → 230 | 20 → 14 |
| bfs-cso-audit | 184 → 174 | 14 → 12 |
| bfs-health | 131 → 101 | 18 → 11 |
| bfs-qa | 282 → 233 | 18 → 13 |
| bfs-documentation | 185 → 191 | 18 → 10 |
| bfs-finisher | 240 → 239 | 19 → 14 |
| bfs-prod-deploy | 290 → 250 | 19 → 13 |
| bfs-landing-report | 167 → 157 | 16 → 12 |
| bfs-bontaflow-memory | 242 → 188 | 19 → 11 |
| bfs-save-context | 171 → 170 | 17 → 9 |
| bfs-load-context | 237 → 248 | 19 → 12 |
| bfs-guard | 295 → 125 | 16 → 12 |

## Priority revision

A second pass followed the requested router → implement → common loading →
design-consultation / plan-tune / QA order. The approved shared skill read
sentence remains intact; HOST's matching-hash rule is shorter. Descriptions,
catalog and the other skills' professional checks are unchanged in this pass.

| Area | Previous pass | Current body words |
|---|---:|---:|
| bfs-router | 700 | 468 |
| bfs-implement | 458 | 329 |
| bfs-design-consultation | 370 | 259 |
| bfs-plan-tune | 320 | 224 |
| bfs-qa | 309 | 233 |
| HOST | 1182 | 1158 |

The same manual acceptance cases were checked against the revised instructions:

| Existing case | Preserved instruction |
|---|---|
| Advice / named skill | Named skill takes precedence; advice creates no workflow. |
| Setup / question presentation | Doctor precedes preference choice; actual answers save at user scope, read back and refresh; unanswered questions do not block or save defaults. |
| Implementation 5a–5d / resume | Actual acceptance, planning-only scope, material-conflict waiting, pending dependents, file drift and final acceptance checks remain explicit. |
| Direct skill / HOST | Skill-specific read, full matching HOST before hash reuse, new-chat reload and effective preference loading remain. |
| Design selection | Equivalent alternatives, default count three, rendered inspection and actual user selection remain; exploration may finish without selection. |
| Preferences / same-chat change | Canonical choices, scoped inheritance/reset, read-back, selected proposals and effective refresh remain. |
| QA 6–7 / coverage | Independent mode/coverage, required comparison bases, unchanged inspect source, original failure evidence and repeated failing interactions remain. |

This is source review, not execution of the native manual cases. The native
status below remains unverified. One full-check run encountered Windows EPERM
renaming a temporary observation file in the parallel-hook fixture (34/35).
The focused parallel-hook rerun passed; no runtime/test changes were made to
hide that failure. Final full-check results are recorded below.

## Output, references and mode revision

The third pass followed Output deduplication → reference conditions →
memory/deploy mode branches → HOST. Business-builder/spec field lists now live
in Output; steps produce and check that result. Memory and deploy execute only
requested mode blocks. Landing-report's delivery pointer explicitly covers
queue/check freshness and version claims; workflow, memory, guard and delivery
command pointers use their existing sections. Section links do not by themselves
prove partial document loading.

HOST points to router setup and QA coverage rules while preserving project-scope
safeguards, independent QA selections and legacy reading. Router's question
branches now distinguish saved, absent, clear, ambiguous and unanswered cases.

### Professional checks reviewed

- Business/spec: observed facts versus estimates, experiments, scope exclusions,
  traceable requirements, contradictions, migration/recovery/rollback and
  requested handoffs remain.
- Memory: canonical project ownership, absent-versus-malformed reads, real source,
  confidence 1–10, revision key/kind, exact prune IDs/history/backup, redacted
  export destination, legacy preview/ownership/confirmation and read-back remain.
- Deploy: exact head/base/environment, existing configuration, content-bound
  CI/review/test results, pending/failed/stale/missing distinctions, fresh head/base
  before merge and queued-versus-merged confirmation remain.
- Automatic deployment precedes manual triggering; deployment and verification
  retain bounded observation, revision/version and configured health checks.
  Uncertain failures inspect remote state before retry; rollback remains requested.
- Read/inspect/verify blocks do not trigger write/merge/deployment blocks.
  Separate workflow stages and immediate stage checkpoints remain.
- Landing: truncated/failed queues, evidence freshness, unreserved version
  proposals, three/four-part versions and explicit sibling-workspace scope remain.
- HOST: acceptance/authorization, actual question answers, waiting/dependent work,
  effective preferences, drift, state isolation, hook trust and secret handling
  remain directly available. The professional checks in other named skills were
  left intact.

Latest full validation: 35/35 tests passed, including memory/history/import,
delivery evidence, read-only state, scoped preferences, QA and link anchors.
At this editing pass, native fresh-chat cases were unrun. The later native
results are recorded in [the A/B validation report](NATIVE-ACCEPTANCE-REPORT.md).
Combined instructions after this pass: 9871 words, compared with
10037 before this pass (166 fewer), and 11127 at initial baseline.

## Automated verification

- `node scripts/check.mjs`: 35/35 tests passed; package checks validate all 29
  skills, catalog/frontmatter, metadata, handoffs, hooks, license and README.
- `git diff --check`: passed.
- Existing link checking now covers HOST and every Markdown reference as well
  as skills, validates local heading anchors and ignores fenced examples.
- Regression case detects absent files and absent section anchors; valid local
  and duplicate-heading anchors pass.
- Existing core tests cover preference values/scopes/reset/legacy stores,
  accepted basis/waiting, content drift, QA selections, HOST hash reload,
  guard fixtures and delivery evidence. Fixtures are not native host proof.

## Native Codex verification

Executed on 2026-09-30 against frozen previous/current source packages in fresh
Codex sessions; see [native A/B validation](NATIVE-ACCEPTANCE-REPORT.md) for
requests, actual reads/actions, changed files, state transitions and limitations.
The same core and model/settings were used within each matched pair.

Implementation/review, planning, waiting, new-chat adoption/drift, direct question
preferences, mode changes, memory, local publication, rendered design and actual
inspect/fix QA were exercised. Two fresh desktop chats additionally recorded
real panels and human choices, followed by unchanged repeated setup.

The initial round exposed missed setup reference reads and a missing-target
questioning gap. Both were fixed and passed focused native checks; see the
[follow-up correction](NATIVE-ACCEPTANCE-REPORT.md#follow-up-correction).
Active guard enforcement was not available in the private state. Automatic global
picker activation, a published package and real provider deployment were not
certified. Automated checks alone remain insufficient for these host behaviors.

## Minimal test round after all revisions

2026-09-30: ran the full existing package check once and a targeted CLI smoke
against isolated temporary project/state directories; no installed plugin or
source implementation was changed.

- `node scripts/check.mjs`: 35/35 passed, including waiting/dependent steps,
  preference scope/reset, memory operations, delivery evidence, QA and local links.
- CLI loaded all 29 edited skills with matching descriptions/default modes.
  Matching HOST hashes omitted HOST; stale hashes and fresh reads returned it.
- All five memory and four deploy modes were accepted by the CLI. `qa-only`
  retained inspect/quick; removed `skillify` was rejected.
- Empty memory/preference reads and doctor created no state. Core readiness
  passed with 29 skills; isolated state had no registered optional engines.
- One smoke-helper assertion incorrectly expected memory list to return an
  object with records; its actual contract is an array. The corrected focused
  assertion passed. This was a test-helper error, not a plugin regression.
- Temporary test directories were removed after verifying their paths.
  `git diff --check` passed.

No core/package regression was observed in that minimal round. Those results
establish instruction delivery and runtime contracts; the subsequent native
A/B round supplies the model/question/browser evidence described above.

## Delivery status

The focused fixes add 50 instruction words: current combined size is 9921 words,
10.8% below the initial 11127. The existing check remains 35/35; five fresh native
sessions verified the setup read order and missing-input questions with no engine.

Source changes, automated checks and the native validation run are complete.
Full native acceptance retains the findings and unverified cases in the A/B
report. During validation, no publication, plugin installation or release operation was performed.
