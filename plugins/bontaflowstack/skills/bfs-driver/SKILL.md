---
name: bfs-driver
description: "Route a business, product, design, development or delivery task to a BontaFlowStack skill or resumable workflow. Use for choosing the next step or coordinating several requested steps."
---

# BontaFlowStack driver

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `route`, `guide`, `setup`. Choose the mode from the actual request.

For setup, run the installed plugin's `scripts/setup.ps1`. Core setup checks
Node.js and the 28-skill catalog. Add `-WithEngines` when browser/render/design
capabilities are requested. `-InstallPrerequisites` permits the setup script to
install missing Node.js with Windows Package Manager. Explain a missing
dependency concretely. Verify doctor for the requested capability after setup;
never report optional engines ready from a core-only check.

1. Identify the requested outcome and whether the user wants advice, one action, or a sequence. A named skill takes precedence.
2. Read the current catalog with `catalog list`. Match the descriptions and modes to the request. Resolve an old name with `catalog resolve <name>`; preserve its returned mode.
3. For advice, explain the relevant route and finish without creating a workflow. For a concrete one-step task, load `read <skill>` and perform it in this task.
4. For several requested steps, choose an appropriate catalog route or an explicit ordered skill list. Remove irrelevant phases before starting. Start one workflow using the common protocol and give each step its actual input and output condition.
5. Load each selected skill, carry forward the user's scope and settled decisions, and execute it. Check its result before recording the step. A blocked, failed or waiting step suspends its dependent steps.
6. Report the achieved result, saved workflow ID and next action. Continue the requested sequence while its prerequisites are satisfied.

Use the narrowest matching skill: page data goes to scrape, interaction testing to qa, code changes to review, and an unexplained defect to bug-issue-investigate. The browser is a shared capability, not the default destination for every web task.
A reusable browser-script request is unsupported in this version; explain the available one-time browse/scrape path. Requests beyond the catalog may be answered directly without inventing a skill.

## References

- [commands](../../references/commands.md)
