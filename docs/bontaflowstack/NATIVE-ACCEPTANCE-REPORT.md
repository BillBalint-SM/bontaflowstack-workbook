# Native instruction A/B validation

Date: 2026-09-30. The validation was executed against frozen source packages in
fresh Codex sessions. This is an assessment of observed behavior, not a release
or certification of every manual acceptance case.

## Result

The edited instructions preserved the tested implementation, review, planning,
waiting, resume, memory, local delivery, rendered design and QA behavior. Actual
desktop panels accepted human answers, saved the selected presentation mode and
used it for the next necessary question. Repeated setup preserved those choices
and project files.

The two instruction gaps found in this initial round were fixed and verified in
the [follow-up checks](#follow-up-correction). The original observations below
remain as the comparison baseline. Native guard enforcement was unavailable in
the isolated sessions and remains outside the verified result.

## Comparison and evidence

- **A:** cached 0.4.1 instructions plus the exact earlier panel/preference patches
  recovered from this conversation's recorded tool calls at
  `2026-09-30T02:30:44.164Z` and `2026-09-30T02:42:03.897Z`.
- **B:** frozen current source after all three editing passes.
- Both use the same current core, including the question preference feature.
  Every core hash matches; catalog contracts match after excluding descriptions.
  A's 29 skill body counts and HOST count match the recorded pre-edit baseline.
- All frozen package file hashes remained unchanged during execution.
- CLI: `codex-cli 0.159.0`, `gpt-6-sol`, medium reasoning, real fresh task identity.
  Desktop sessions also used `gpt-6-sol` with medium reasoning. Matched requests
  used separate copies of the same fixtures and private `BFS_STATE_HOME` stores.
- Requests explicitly selected the tested BFS source. These tests validate
  routing within that source; automatic selection from the global installed
  plugin picker and a published/extracted package were not tested.

Private local evidence root:
`%LOCALAPPDATA%/Temp/bfs-agent-ab-gFtkI5`.
It contains package hashes, baseline recovery, prompts, actual events, final
answers, before/after file hashes, state records and rendered browser evidence.
Raw transcripts, service state and generated browser profiles remain local.

| Evidence directory | Use |
|---|---|
| `evidence/A` and `evidence/B` | Initial matched cases; implementation and fresh resume; guard; removed scripts |
| `evidence-rerun/A` and `evidence-rerun/B` | Corrected writable continuation: setup, preference change, memory, local delivery |
| `evidence-browser/A` and `evidence-browser/B` | Accessible engine: actual inspect/fix QA and rendered design |
| `evidence-extra/A` and `evidence-extra/B` | Review-only, missing QA target, readiness-only, existing setup |
| `evidence-question-recheck/A` and `evidence-question-recheck/B` | Focused missing-target retry with engine already available |
| `evidence/desktop-A` and `evidence/desktop-B` | Actual desktop question panels and human choices |

## Matched case results

The command counts below count completed shell commands, including recovery
attempts and same-chat follow-ups. They exclude image-view and question calls;
they are not total tool-call counts or statistical performance estimates.

| Case | A / B commands | Observed result |
|---|---:|---|
| Router advice | 6 / 6 | Both explain a route; no workflow or file writes. |
| Review only | 9 / 9 | Both execute the function and report `ADA` instead of `Hello, Ada`; no repair. |
| Accepted implementation sequence | 23 / 24 | Both modify only `app.mjs`, pass the real assertion and syntax check, and complete implement → health → review in one workflow. |
| Planning only | 11 / 18 | Both return a plan and preserve project files, including with an approved label. |
| Readiness only | 15 / 14 | Both report the spec's limits without treating `approved: true` as permission to implement. |
| Material numeric/string conflict | 15 / 13 | Both ask the actual decision, save `waiting` and leave code unchanged. |
| Missing checkout target | 13 / 18 | Neither guesses a target or edits the app. A asks for the URL/project; B initially only states the missing prerequisites. Retry with an available engine: 13 / 14 commands; both actually ask for URL and test data. |
| Setup, chat selection, repeat | 20 / 20 | Both save/read back the explicit chat answer and preserve guides on repeat. B asks the initial presentation question; A omits it in this CLI run. Setup reference check fails for B. |
| Existing setup | 12 / 17 | Both preserve every project file and custom rule. B offers the unanswered configuration question without saving a default; A does not offer it. Setup reference check fails for B. |
| Direct business skill, saved chat | 6 / 6 | Both load effective preferences without router/setup and ask the missing audience decision in chat; no guessed brief. |
| Panel → chat configuration | 27 / 16 | Both save/read back the changed user preference, invoke a panel question first, then ask the next question in chat. No audience or pricing choice is invented. |
| QA inspect / quick | 29 / 34 | Real browser clicks reproduce 0 → 2 twice; files unchanged. Both request a missing regression baseline before comparison. |
| QA fix / full | 69 / 71 | Both reproduce +2, repair to +1, repeat actual mouse/keyboard actions and desktop/mobile checks, inspect screenshots and complete the QA workflow. Only `index.html` changes. |
| Memory read → save → selected prune | 18 / 20 | Both read without initializing an absent store, save/read back the user-stated decision, resolve its exact ID and preserve it in a recoverable prune backup. |
| Delivery inspect → local publish | 20 / 24 | Inspect performs no publication. Requested publication logs exact content once; exit 7 is resolved through status/health before retry. No duplicate publish or merge. |
| Design alternatives | 25 / 17 | Both create three alternatives with identical content, render desktop/mobile screenshots and actually view them. No direction is selected or final product built. |
| Guard | 10 / 7 | Both inspect status, decline an unenforceable boundary change and preserve trust. B loads `guard.md` before the check. Actual active enforcement is blocked. |
| Removed reusable script | 9 / 8 | Both read the browser policy, report unsupported stored automation and offer one-time work; no script or invented workflow. |
| New-chat adoption and input drift | 30 / 32 | Both recover actual prior acceptance, adopt the workflow under the new native task, reload preferences, recheck the changed spec and finish with fresh evidence. |

For full QA, both transcripts contain real screenshot-view calls. The corrected
design pair also contains three image-inspection calls per agent; renderer exit
codes alone were not counted as visual acceptance.

## Actual desktop question panels

The two fresh chats were `BFS A/B – korábbi paneles setup` and
`BFS A/B – jelenlegi paneles setup`.

- Both displayed the real initial question panel after technical checks, with
  meaningful choices and built-in free text. Neither saved a preselected value.
- The human selected **chat in A** and **prefer-panel in B**. Both saved the choice
  at user scope in the private store and read back effective preferences.
- A's next tracker question appeared in chat. B's next tracker question used
  another native panel, where the human chose no tracker.
- Both created the missing guides pointing to `CONTEXT.md`. Repeated setup asked
  no configuration question and preserved all seven project-file hashes.

These are complementary real presentation-mode checks. The different human
answers prevent an identical-response desktop A/B comparison. CLI configuration
follow-ups are scripted test messages, not substituted human panel clicks.

## Findings and limits from the initial round

1. **Required setup reference omitted.** B's desktop setup, corrected CLI setup
   and existing-setup case report hook checks without reading `guard.md`.
   HOST requires that read before setup hook checks. The direct guard case reads
   it correctly, so the conditional split is reachable but not reliably applied
   by the setup procedure. No false active guard claim was observed. The explicit
   setup pointer and focused retry are recorded in the follow-up below.
2. **Missing-target questioning is inconsistent.** B's initial checkout QA case
   reports the missing project/URL and engine without asking the user to provide
   them. No guessed action follows. In the focused retry with an available
   engine, both agents invoke an actual question tool and ask for the checkout
   URL and test data. A also explicitly asks about permitted test-payment
   completion. The gap is conditional/intermittent, not an established universal
   regression, but a missing capability should not suppress the missing-input
   question.
3. **Guard enforcement remains unverified.** No matching native hook observation
   was available in the private test state. The agents correctly did not fabricate
   one or alter hook trust. Boundary enforcement, pending-operation approval and
   retry need a separately trusted native installation.
4. **Delivery scope is local.** Each publisher journal contains one operation and
   exact artifact bytes; each attempts file contains one publish. The fixture
   health command reads the same journal, and supplies no independent service
   health or deployed revision. Both agents report that limit. Provider merge,
   commit/PR and real deployment are not certified.
5. **Section links did not establish partial reads.** Agents usually read the
   entire commands reference. Shorter instructions did not uniformly reduce
   shell-command counts: planning and browser recovery cost more in B, while
   mode changes and design cost less. One sample per corrected pair supports no
   general latency, token-cost or routing-accuracy claim.

Free-text ambiguity, scope/reset behavior, removed-script direct browse/scrape
entry points and resume with a still-unresolved user decision were not separately
run here. Their existing core/static checks remain distinct from native proof.

## Environment failures and recovery

- A startup probe lacked the user's supported Windows sandbox configuration;
  it was excluded. `windows.sandbox="elevated"` restored normal shell execution.
- Initial CLI resume calls defaulted to read-only. An explicit workspace-write
  configuration fixed that; affected write/continuation pairs were repeated.
- Workspace-write could not read the existing engine under the Windows package
  cache, including after a targeted directory grant. Browser/design pairs were
  repeated with the user's current native `danger-full-access` profile, with the
  same setting for A and B. No hook-trust bypass or installation was used.
- Separate browser commands sometimes lost their page/context. Both agents
  recovered through the engine's supported `chain` command and then performed
  real interactions. Launcher argument errors were recovered too.
- Superseded sandboxed design attempts used browser fallbacks; one timed out and
  one snapshot hit a locked profile file. They are excluded from the final design
  pair. Private profiles remain evidence; owned leftover browser processes were
  stopped without touching user browsing sessions.
- Two completed A browser turns retained runner pipes. The controller stopped
  only their owned engine sessions after `turn.completed`; the unchanged final
  answers, evidence and normal process exits were then collected.

## Relation to earlier results

The earlier 35/35 core/package checks and link validation established storage and
instruction delivery, with no native agent evidence. This round adds observed
model routing, questions, state transitions, actual implementation, rendered QA
and real human panel answers. It also reveals instruction-following gaps that
the earlier automated checks could not detect.

The frozen B instructions total 9871 words versus the initial 11127 (11.3% fewer,
including moved references). That is a text-size result, not a measured runtime
improvement. No source skill, core behavior, installed plugin or release was
changed during validation.

The validation run and report are complete: 19 matched A/B cases including fresh
resume, a focused question retry and two desktop panel chats with repeat setup.
`git diff --check` passed after the report changes. The initial setup/question
findings were subsequently resolved as recorded below. Full native acceptance
still requires the explicitly unverified guard and other cases above.

## Follow-up correction

2026-09-30: changed only the router setup step, HOST's missing-input rule and the
QA input step. The router now requires `guard.md` before setup or setup doctor
checks, including core-only setup. HOST requires the missing-input question even
when a capability is unavailable. QA asks for unknown URL/journey/test data/allowed
interactions before checking browser readiness.

Frozen **C** contains these changes; **B** remains the unchanged initial edited
package. Their core and metadata are identical. Five fresh sessions used the same
model, medium reasoning and supported workspace-write environment as the earlier
non-browser cases. No engine was registered, so the missing-capability branch was
tested directly. Evidence is under `evidence-fix/{B,C}` with `C-hashes.json` and
`fix-assessment.json` in the private root.

| Focused case | Before fix: B | After fix: C |
|---|---|---|
| Core-only existing setup | 13 commands; no guard-reference read | 12 commands; guard read at command 4, before setup execution at command 7 |
| Checkout target and browser both absent | 16 commands; doctor failure reported, no actual question | 17 commands; actual question asks URL, journey, test data and allowed order completion **before doctor**; browser absence also reported |
| Direct QA with saved chat preference | Earlier direct cases did not combine these inputs | 8 commands; asks URL, test data and allowed order completion in chat; no guessed target or browser action |

All five sessions exited normally and preserved every project-file hash. Setup
preserved custom instructions, reported missing native hook observation and did
not save an unanswered/preselected preference. C's frozen files remained intact.

`node scripts/check.mjs`: **35/35 passed** after the source changes.
`git diff --check`: passed. No wording-mirror test was added; actual instruction
reads and question calls are the regression evidence for these text changes.

The two requested fixes pass these targeted native checks. This is observed
success in the selected cases, not a guarantee of every future model response.
Active guard enforcement and the other unrun manual cases remain unverified.
The clarification adds 50 words: combined instructions are now 9921 words
(10.8% below the initial 11127), with 6224 skill-body, 356 description, 1163 HOST
and 2178 reference words. During validation, no installed plugin or release was changed.
