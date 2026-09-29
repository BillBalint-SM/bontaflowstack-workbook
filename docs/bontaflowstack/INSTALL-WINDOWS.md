# Install BontaFlowStack on Windows

## Requirements

- Windows x64 and Codex Desktop.
- Node.js 24 or newer on PATH.
- Git for Git-based installation and delivery workflows.
- npm, included with Node.js, for installing the optional engine dependencies.

The core has no npm dependency installation. Engine setup downloads locked npm
dependencies and Chromium to its own directory. Git Bash and jq are unnecessary.

## Install from GitHub

Run in PowerShell with the Codex CLI on PATH:

```powershell
codex plugin marketplace add BillBalint-SM/bontaflowstack-workbook --ref main
codex plugin add bontaflowstack@bontaflowstack
```

Start a new chat in your project. Ask `$bfs-router Set up BontaFlowStack`.
Include "browser and design capabilities" to run the optional engine installer.
Open `/hooks` in the Codex CLI and review/trust this plugin's PreToolUse and Stop
definitions. Installation alone does not trust hooks; changed definitions need
review again. See the [official hook guide](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks).
Setup with `-InstallPrerequisites` can use Windows Package Manager to install
missing Node.js. Existing unsupported Node versions produce an upgrade message.

## Set up the target project

The PowerShell setup checks the plugin installation. To add project guidance,
open a Codex chat in the target project and request:

```text
$bfs-router Set up BontaFlowStack for this project.
```

The driver checks `AGENTS.md`, issue-tracker guidance, domain terms and decision
locations before changing project files. It creates a missing
`docs/agents/issue-tracker.md` with the chosen tracker location and its read,
publish and update procedure; a missing `docs/agents/domain.md` points to the
actual domain and decision sources. It adds only missing `AGENTS.md` links.
Existing instructions are not replaced. If the tracker or domain source is not
clear, answer the driver's focused question first. A Git remote alone does not
mean specifications belong in GitHub Issues. Choosing no tracker is valid and
is recorded explicitly. Setup never creates invented terms, labels or ADRs.

For example, an empty project may need the answer “Use local Markdown issues in
`tasks/`; keep domain terms in `CONTEXT.md` and decisions in `docs/adr/`.” The
driver can then create the two guides and their `AGENTS.md` pointers. Verify the
reported created and reused paths, open each pointer, and rerun the same setup
request: it should leave the guides unchanged. Use `doctor` to confirm requested
core or browser capabilities; a core-only check does not prove browser readiness.

`bfs-guard` is not started by the driver. Invoke `$bfs-guard Show the current protection
status.` directly when you want task protection. Skill selection does not itself
authorize publication, deployment, spending or destructive changes.

## Install a source ZIP or clone

Extract the complete repository ZIP to a stable directory, or clone it. From that
directory:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup.ps1 -InstallPlugin -WithEngines
```

`-InstallPlugin` registers the local directory as a marketplace and installs the
plugin through Codex. Keep that source directory for updates. `-WithEngines`
installs the exact optional engine release recorded in
`plugins/bontaflowstack/engines.lock.json`. Omit either switch when that step is
already handled. Add `-InstallPrerequisites` to install missing prerequisites.

To inspect the package before installation:

```powershell
node scripts/check.mjs
powershell -NoProfile -File plugins/bontaflowstack/scripts/bfstack.ps1 -Command doctor
```

## Verify an installed plugin

Ask in a new chat:

```text
$bfs-router Check the installed catalog and capabilities, then guide me to the next step.
```

There must be exactly 29 skill entries. Core readiness and engine readiness are
reported separately. `doctor bfs-browse` must report the browser capability ready
before a browser-dependent task starts. Images use the Codex image generation tool
available in the chat; no separate API key is needed. Optional impeccable and
Google DESIGN.md commands report unavailable until their external installations
are configured; this does not block the browser, renderer or ordinary design work.

The first browser operation starts the local browser. A visible session supports
manual login and continuation. Close it with the bfs-browse skill when finished.

## Update

For a Git marketplace, run `codex plugin marketplace upgrade bontaflowstack`, then
`codex plugin add bontaflowstack@bontaflowstack`. For a local source installation,
update its files first, then repeat the plugin-add command. Start a new chat.
Run setup with `-WithEngines` when the pinned engine version changes.

Engine releases install to distinct version/checksum directories. Local project
memory and checkpoints remain separate from the plugin cache. Updating the plugin
does not remove old data. Legacy notes can be previewed and imported with
`memory import-legacy`; original files remain untouched. Legacy guard state and
historical permissions are not imported.

## Troubleshooting

| Message or symptom | Action |
|---|---|
| `node` is missing or too old | Install Node.js 24+ and reopen PowerShell/Codex. |
| `codex` is not recognized | Add the Codex CLI to PATH, or use Desktop's plugin installation interface. |
| Optional engines are missing | Run the installed plugin's `scripts/setup.ps1 -WithEngines`. |
| Archive checksum mismatch | Stop installation; download the pinned release again. No archive source has run. |
| Engine component changed/missing | Inspect the installation and rerun the explicit installer; do not bypass the hash check. |
| Incomplete engine directory | Inspect the named failed installation. Preserve useful logs before removing only that directory and retrying. |
| Another process holds a state lock | Wait for that operation and retry. Never remove a lock while its writer is active. |
| Guard lacks a native observation | Review/trust the plugin definitions in `/hooks`, then use a new chat. Manual hook invocation is not native integration evidence. |
| Saved checks are stale | Recheck the changed inputs and rerun the affected workflow step. |
| Codex image tool unavailable | Use a chat with image generation available, or choose local HTML variants. |
| External design checker unavailable | Install/configure the selected optional tool as described in the engine README. |

Set `BFS_STATE_HOME` only for an intentional separate state directory, such as an
isolated verification run. No developer checkout, personal runtime cache or global
skill directory is required by the installed package.
