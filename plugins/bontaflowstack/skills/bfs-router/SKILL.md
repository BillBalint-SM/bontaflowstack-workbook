---
name: bfs-router
description: "Set up BFS or route a requested task to the matching skill or workflow."
---

# BFS Router

Load [HOST.md](../../HOST.md) via `read bfs-router`; follow its hash-based read protocol.
Modes: `route` for execution, `guide` for advice, `setup` for installation/project setup. Default: `route`.

## Setup

1. Read [guard](../../references/guard.md) before running `scripts/setup.ps1` or any setup doctor check, including core-only setup: these report native hook readiness. Then run the installed plugin's setup script. Core setup checks Node.js and the catalog. Add `-WithEngines` for requested browser/render/design capabilities; `-InstallPrerequisites` permits installing missing Node.js through Windows Package Manager. Explain missing dependencies and verify doctor for each requested capability; core readiness does not certify engines.
2. After technical checks, reuse effective preferences:
   - Saved `question-presentation`: keep it without asking again.
   - Absent: ask "How would you like to answer BFS decision questions?" Offer available panels (recommended) or chat, with consequences and built-in free text under HOST rules.
   - Clear actual answer: map to `prefer-panel` or `chat`; save both canonical options, question and choice at user scope. Read back and refresh preferences; report failed saves.
   - Ambiguous answer: clarify before saving. Unanswered/dismissed: save nothing and continue setup where other inputs permit; later setup may ask again. Preselection is not an answer.
3. For requested project setup, read existing `AGENTS.md`, `docs/agents/issue-tracker.md`, `docs/agents/domain.md` and glossary/context/ADR pointers. Inspect remotes and issue references for clues; a remote alone does not select GitHub Issues. Reuse existing instructions and ask only for missing tracker/domain choices before dependent writes.
4. Create only missing guides: tracker choice/location and actual read/publish/update procedure, or explicit no-tracker choice; domain guide pointing to the agreed terminology/decision source. Create glossary/ADR material only from real content. Add only missing AGENTS links; preserve existing guides and user edits. Read back and validate links. Repeated setup makes no edits.

## Routing

1. Identify advice, one action or a sequence. A named skill takes precedence. Read `catalog list`; match task, description and mode. Resolve old names with `catalog resolve <name>` and preserve the returned mode.
2. Reuse verified context and accepted inputs to choose the next useful action. An accepted specification with usable acceptance cases routes directly to bfs-implement; a missing brief alone does not add discovery or repeat approval. For advice, explain the route without creating a workflow. For one action, load `read <skill>` and execute in this task. For a sequence, remove irrelevant phases from a catalog route or ordered skill list and start one workflow with actual inputs and output conditions.
3. Read each selected skill under HOST's hash protocol. Carry forward scope and decisions; inspect its result before recording the step. Continue while prerequisites hold; blocked, failed or waiting steps suspend dependent work.

Choose the narrowest match: page data → bfs-scrape; interaction tests → bfs-qa; accepted implementation → bfs-implement; changed-code inspection → bfs-review; unexplained defect → bfs-bug-issue-investigate. Browser is a shared capability.

Apply bfs-implement's accepted-basis rules before editing. Idea ends at plan review; implementation requires requested scope and acceptance. Planning requests return a plan; material revisions leave work `waiting`. HOST authorization applies to every route.

For reusable browser scripts, read the [removed-feature policy](../../references/browser.md#removed-browser-scripts) and report unsupported automation. Answer other out-of-catalog requests without inventing skills.

Output: Achieved result, workflow ID when created, next action; setup capability readiness, created/reused guides and unresolved choices.

## References

- [commands](../../references/commands.md): when constructing a core request.
