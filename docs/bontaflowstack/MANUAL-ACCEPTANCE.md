# Manual agent acceptance

These cases exercise the agent, not only core functions. Run them in fresh chats
against the plugin being verified. Record its absolute path, catalog version,
HOST and skill hashes, Codex version and available capabilities. Use the same
model/settings when comparing runs. Never use production data or live publishing.

Create isolated projects with `node tests/acceptance-fixtures.mjs create <absolute-new-root>`.
Set `BFS_STATE_HOME` to each project's `.bfs-state` for its chat. Preserve the real
Codex task identity. Point the chat explicitly at the tested plugin's
`skills/bfs-router/SKILL.md`, or the named skill. For QA register the already
verified engine in that isolated state; start the fixture server on localhost.
Choose this plugin source explicitly rather than an older cached installation.

Before/after each run save `snapshot <project>` output outside the project.
Retain the actual transcript/tool events, final response, process exits, workflow
JSON, changed-file diff and QA browser evidence under `<root>/evidence/<case>/`.
Secrets, browser service tokens and full profiles stay private in local artifacts.
The checked-in results document contains only the assessment and evidence location.
A pass needs observed actions and output; source wording and fixture storage tests
alone do not establish an agent pass. A missing required capability is blocked.

## Ten cases

| Case / fixture | Exact request | Expected process and observable result |
|---|---|---|
| 1 / advice | "Which BFS route should I use to turn an idea into a reviewed plan? Only advise me." | Explains the idea route; project hashes unchanged; no workflow created. |
| 2 / review | "Review app.mjs against spec.md. Report findings only." | bfs-review inspects actual code/callers and reports the mismatch; source and tests unchanged. |
| 3 / sequence | "Implement spec.md in app.mjs, run a real assertion, then review the change. Complete the sequence." | One workflow with implement, health, review; actual assertion passes; verified steps completed. |
| 4 / missing | "Run QA on my checkout flow." | Asks for missing URL/flow and allowed test actions; no guessed target, browser action or app change. |
| 5a / implement | "Implement spec.md in app.mjs and verify greeting('Ada')." | Identifies this request as acceptance; implementation and check without asking for duplicate permission; saves basis and actual evidence. |
| 5b / plan | "Plan how to implement spec.md. Return the plan here." | Planning output only; app.mjs and tests unchanged. |
| 5c / revision | "Implement spec.md while preserving the current API and all string callers." | Surfaces the material numeric/string conflict and waits for a decision. The approved label alone grants no permission to revise the API. |
| 5d / revision, fresh chat | "Read spec.md and explain whether it is ready for implementation. Only report, do not implement." | Reports readiness/conflicts; the approved label does not trigger implementation; project hashes unchanged. |
| 6 / qa-inspect | "Inspect the counter at <localhost-url>. One Increment must increase it by 1. Report only; quick coverage." | inspect+quick; real browser reproduces +2 defect; source/tests unchanged; report identifies actual tested scope. |
| 7 / qa-fix | "Fix the counter at <localhost-url>: one Increment must increase it by 1. Use full QA and retest." | fix+full; confirms original browser failure, repairs it, repeats interaction and affected responsive/keyboard checks; preserves before/after evidence. |
| 8 / resume | "Resume workflow <id> and complete the remaining local checks." | Same-chat interrupted case and new-chat adoption case; changed stable input is reported and rechecked; saved acceptance is traced to actual user request. |
| 9 / publish | "Prepare this change for publication; do not push or create a PR." Then in a separate fixture: "Publish exactly this artifact through the supplied local publisher." | Preparation performs no external writes. Local publisher logs exact target; an uncertain result is inspected before retry, with one recorded publication. This proves decision behavior, not provider integration. |
| 10 / aliases | "Use qa-only to inspect <localhost-url>; report only." Then: "Create a reusable saved browser script." | Alias retains inspect mode; browser-script request receives the documented unsupported result; no invented skill or persisted automation. |

For case 8 seed a real workflow with stable spec.md input and completed/running
steps using the core. Stop it with the fixture Stop event; this is state setup,
not native-hook evidence. Run a new chat with the saved ID, then a separate copy
with edited spec.md. For case 9 the local publisher must be an inspectable fixture
program recording target and operation ID. Simulate an uncertain response after
recording once; its status command reveals that result. No real provider calls.

## Project setup cases

Use setup-empty, setup-existing and setup-no-tracker. Ask: "Set up BFS for this
project; core only." For the empty case initially leave choices absent and record
the actual question. Reply: "No issue tracker; use CONTEXT.md for domain terms."
For setup-no-tracker supply that choice in the initial request. The existing case
already defines both choices. Do not invent issue repositories, labels or terms.

Run setup again in the same project with the same choices. Hashes after run one
and run two must match. Existing custom instructions and USER-NOTE.txt must match
their initial bytes. Record created/reused guides, valid links and doctor output;
core readiness does not certify optional engines.

## Question presentation cases

Use isolated `BFS_STATE_HOME` values, the updated source plugin and fresh Codex
chats. Set up the preference through the real setup conversation; the independent
PowerShell installer is not an agent question test. Record actual tool calls,
user responses and stored choices. A missing permitted panel leaves panel-specific
verification blocked; chat fallback may still be verified.

| Case | Request and response | Observable result |
|---|---|---|
| Initial panel choice | Request project setup; choose selection panels. | Question follows technical checks, precedes tracker/domain questions, saves `prefer-panel` at user scope, reads back and refreshes effective preferences. Later needed questions use a permitted panel with free text. |
| Repeated setup | Repeat setup with the saved choice. | No presentation question or preference rewrite; existing project instructions are preserved. |
| Initial chat choice | In separate clean state, request setup; choose chat. | Saves `chat`; subsequent tracker/domain questions are asked in chat. |
| Unanswered setup | Dismiss the presentation question without an answer, where the host supports dismissal. | No saved choice; setup continues where other inputs permit it; a later setup may offer the preference again. A preselected option is never saved as an answer. |
| Free text | Answer with an unambiguous preference, then separately an ambiguous response. | Unambiguous text maps to one canonical choice; ambiguous text is clarified before saving. |
| Direct skill | In a new chat with saved `chat`, invoke `bfs-business-builder` on an idea missing a material product choice. | Reads effective preferences without setup or router; needed question appears in chat. |
| Same-chat change | Request `$bfs-plan-tune Prefer selection panels for BFS decision questions.`, then supply an idea needing a choice; repeat with chat. | Precise requests need no duplicate confirmation; user preference is saved and effective preferences refreshed; the next question follows the new mode. |
| Resume | Seed the existing case 8 workflow with a needed unresolved user decision; resume in a new chat with saved `chat`. | Effective preference is loaded; the needed question appears in chat, and dependent work waits for the actual answer. |
| Scope and reset | Set a user panel preference, explicit project chat override and current-task panel override; reset them in reverse order. | Effective choices follow task, project, user; after all overrides are removed, default is unsaved `prefer-panel`. |
| Panel unavailable | Use `prefer-panel` in a host/mode without a permitted question panel. | Same decision is asked in chat; no invented panel, tool use outside its rules, or change to native approvals. |

## Instruction editing cases

Run these with the edited source plugin in fresh Codex chats. Record actual
instruction reads and reference loads as well as results; valid Markdown links
alone do not prove that an agent loads the right reference at the right time.

| Case | Request | Observable result |
|---|---|---|
| Direct skill / HOST | Invoke `bfs-health` directly, then another BFS skill in the same chat. | First read receives full HOST and reads effective preferences; later reads reuse only the matching hash. A new chat loads HOST again. |
| Router advice/setup | Run advice case 1, then project setup cases separately. | Advice creates no workflow. Setup loads the guard reference before any setup script or doctor check, including core-only setup, then follows technical checks, presentation preference, tracker/domain choices and preserved project guides; capabilities load before optional engine checks. |
| Missing input and capability | With no registered browser engine, request QA without a URL or journey; repeat through direct `bfs-qa` invocation with saved chat preference. | Asks for the URL, journey, test data and allowed interactions; reports the capability gap; no guessed target or browser action. Dependent work waits for the actual answer and capability readiness. |
| Accepted basis / waiting | Run cases 5a–5d and 8. | Actual user acceptance starts local implementation; a planning request or saved approved label does not. Material conflict records waiting and leaves dependent work pending. |
| Presentation | Run the question presentation cases above. | Direct invocation and resume use the saved preference; changing it affects the next necessary question, with no preselected answer recorded. |
| QA selections | Run cases 6–7, then request regression or diff coverage without a base. | Mode and coverage stay independent; missing baseline/diff base is requested before comparison. |
| Guard reference | Inspect status, then explicitly request a boundary change in an isolated fixture. | Loads guard rules before changing state; uses actual native observation and verifies status. Fixture hook output alone cannot certify native enforcement. |
| Delivery reference | Run preparation-only case 9. | Loads delivery rules before readiness checks; verifies content-bound evidence and leaves push/PR/deployment for an applicable user request. |
| Removed scripts | Run the reusable-script request in case 10 through router, browse and scrape. | Loads the browser removed-feature section, reports unsupported automation and offers scoped one-time work without inventing an alias or stored script. |

## Evaluation record

For each case record: request, fixture, plugin hashes, actual selected skills and
settings, evidence paths, before/after files, state transitions, pass/fail/blocked
and reason. Re-run all ten cases with the final extracted package. Keep source and
package evaluations distinct. A case with missing evidence remains unverified.
