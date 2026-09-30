---
name: bfs-router
description: "Route a business, product, design, development or delivery task to a BontaFlowStack skill or resumable workflow. Use for project setup, choosing the next step or coordinating several requested steps."
---

# BFS Router

At first use in this chat, run the local core's `read bfs-router` to load
[HOST.md](../../HOST.md) and keep its returned `hostSha256`. If this chat already
loaded the matching HOST through `read`, reuse that hash. Every later skill
`read` request sends `knownHostSha256`; a response with full HOST replaces the
loaded contract and hash. A new chat starts with a full read.
Modes: `route`, `guide`, `setup`. Choose the mode from the actual request.

For setup, run the installed plugin's `scripts/setup.ps1`. Core setup checks
Node.js and the skill catalog. Add `-WithEngines` when browser/render/design
capabilities are requested. `-InstallPrerequisites` permits the setup script to
install missing Node.js with Windows Package Manager. Explain a missing
dependency concretely. Verify doctor for the requested capability after setup;
never report optional engines ready from a core-only check.

When the user explicitly asks to set up BontaFlowStack for the current project,
also adapt the project instructions after the installation check:

1. Read existing `AGENTS.md`, `docs/agents/issue-tracker.md`,
   `docs/agents/domain.md`, and any project glossary, context or ADR pointers.
   Inspect the Git remote and existing issue references for clues, but do not
   treat a remote alone as a decision to use GitHub Issues.
2. Reuse existing instructions. If the issue tracker or source of domain terms
   remains unclear, ask the user for only those missing choices before writing
   the dependent file. Do not invent a tracker, labels, commands or domain terms.
3. Create a missing `docs/agents/issue-tracker.md` with the selected tracker,
   its location and the actual read, publish and update procedure where
   applicable. Record an explicit choice not to use a tracker when that is the
   user's choice. Create a missing `docs/agents/domain.md` pointing to the
   agreed source of domain terms and decisions. Do not create a glossary or ADR
   without real content.
4. Add only missing links to these guides in `AGENTS.md`; preserve all other
   instructions and user edits. Never replace an existing guide with a template.
   Read back the files and check the links. Repeating setup should make no edits.
5. Report separately which capabilities are ready, which project files were
   created or reused, and which choices still need the user.

1. Identify the requested outcome and whether the user wants advice, one action, or a sequence. A named skill takes precedence.
2. Read the current catalog with `catalog list`. Match the descriptions and modes to the request. Resolve an old name with `catalog resolve <name>`; preserve its returned mode.
3. For advice, explain the relevant route and finish without creating a workflow. For a concrete one-step task, load `read <skill>` and perform it in this task.
4. For several requested steps, choose an appropriate catalog route or an explicit ordered skill list. Remove irrelevant phases before starting. Start one workflow using the common protocol and give each step its actual input and output condition.
5. Load each selected skill with `read <skill>` and JSON `knownHostSha256` from this chat's full HOST read. Carry forward the user's scope and settled decisions, and execute it. Check its result before recording the step. A blocked, failed or waiting step suspends its dependent steps.
6. Report the achieved result, saved workflow ID and next action. Continue the requested sequence while its prerequisites are satisfied.

Use the narrowest matching skill: page data goes to bfs-scrape, interaction testing to bfs-qa, implementation of an accepted plan/spec/design to bfs-implement, inspection of existing code changes to bfs-review, and an unexplained defect to bfs-bug-issue-investigate. The browser is a shared capability, not the default destination for every web task.
For implementation, load bfs-implement and apply its accepted-basis rules before editing. A successful plan review is not user acceptance. The idea route ends with a reviewed plan; continue into implementation only within the user's requested scope and after acceptance of the concrete basis.
A concrete direct implementation request accepts its identified basis; carry that
request into bfs-implement and start without a duplicate permission question.
For a planning request, return the requested plan. A material revision requires
the actual user decision and leaves affected workflow work waiting.
For a reusable browser-script request, apply the [shared browser removed-feature policy](../../references/browser.md) and report the unsupported result. Other requests beyond the catalog may be answered directly without inventing a skill.
Selecting a skill or route does not authorize publication, deployment, spending
or destructive changes; check the user's actual request before those actions.

## References

- [commands](../../references/commands.md)
