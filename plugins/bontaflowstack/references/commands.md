# Core command reference

Run from the selected project. JSON requests use `--input <file>` or `--input -`
on `node <plugin>/core/cli.mjs`. The PowerShell launcher takes `-Command`,
`-Action`, `-Skill` and `-InputFile`. `help` lists available actions.

## Catalog and readiness

- `catalog list`: current skills, modes, required capabilities and handoffs.
- `catalog resolve <name>`: canonical skill and alias mode.
- `read <name>`: HOST plus that skill's instructions, without executing them.
- `doctor [skill]`: core and selected default mode readiness; JSON `mode` selects another mode.
- `engine status`: per-capability readiness without starting an engine.

## Workflow

```json
{"goal":"Build the requested page","skills":["design-consultation","design-html","qa"]}
```

Send this to `workflow start`. Alternatively provide `route`: `idea`, `website`,
`repair` or `delivery`. Routes are ordered suggestions selected for the request.
An explicit selection may also be `{"skill":"qa","mode":"inspect"}` instead
of a string. Each saved step retains its selected mode.

```json
{"id":"<returned-id>","step":"1","inputs":["brief.md"]}
```

Send to `workflow begin`. After executing and checking that step:

```json
{"id":"<returned-id>","step":"1","status":"completed","summary":"Direction selected","evidence":["User selected option B; DESIGN.md checked against the brief"],"outputs":["DESIGN.md"],"decisions":["Option B selected"],"next":"Implement the page"}
```

`workflow step` also accepts `failed`, `blocked` and `waiting`. These save the
actual result and suspend dependent work. File paths are project-relative.
`workflow list` and `workflow checkpoints` are read-only. `workflow resume`
takes `{"id":"..."}` and reports drift. `workflow adopt` additionally requires
`"confirm":"resume"` to continue from a different task in the same workspace.
Reopening a step preserves its prior result as history and resets dependent
steps to pending. Resume also reports changes to Git HEAD/branch and Node version.

`workflow save` creates an immutable manual checkpoint:

```json
{"goal":"Launch the page","summary":"Design complete","decisions":[],"remaining":["Implement the selected design"],"files":["DESIGN.md"]}
```

`workflow import-legacy` previews a selected text/Markdown snapshot using `file`.
Import with `goal` and `confirm: "import"`. It preserves the original bytes as
context only; no old permissions, guard policy or successful checks are imported.

## Memory

`memory list/search` accepts optional `query`, `kind`, `type` and `limit`.
`memory put` appends a revision of a key/kind pair:

```json
{"kind":"learning","key":"checkout-retry","type":"pitfall","text":"The checkout request must carry its existing operation ID on retry.","source":"observed","confidence":8,"files":["checkout.js"]}
```

Kinds are `decision` and `learning`. Sources are `user-stated`, `observed` and
`inferred`; imports use `imported`. `memory stats` reports revision/current
counts. `memory export` returns Markdown. `memory prune` takes exact `ids` and
keeps a backup; earlier revisions can become current after removing the latest.

`memory import-legacy` takes `file`, previews JSON/JSONL decision/learning
records, then imports with `confirm: "import"`. Verify the original project's
ownership first. Repeated import of the same bytes is idempotent.

## Preferences

All operations accept `scope`: `user`, `project` (default) or `task`.
`inspect` reads that scope; `effective` shows user → project → task precedence.
`set` takes `id`, `question`, distinct `options` and a matching `choice`.
Eligible IDs: `plan-design-review-mode`, `plan-devex-review-mode`,
`detail-preference`. `reset` removes the exact ID at the selected scope.

`profile` takes `values` with declared 0..1 values for `scope_appetite`,
`risk_tolerance`, `detail_preference`, `autonomy`, `architecture_care`.
`enable` takes a boolean `enabled`. For enabled project tuning, `question`
records an eligible `id`, `question` and actual `answer`.

`stats` reads observations. `propose` takes `kind` (`preference`, `profile`,
`memory`), its operation payload in `value`, and a source quotation in `source`.
`apply` takes the chosen proposal `id` and `confirm: "apply"`. These are advisory
preferences, never answers to permissions or safety decisions.

## Guard

`guard status` is read-only. Mutations require `observation` containing the
matching marker from the actual native hook context.

```json
{"observation":"<actual BFS_GUARD_OBSERVED marker>","warnings":true,"boundary":"src"}
```

`guard set` changes only provided fields. `release` clears the boundary and
`off` clears both policies. A recognized destructive command is blocked and
returns a pending ID. After applicable user authorization for that exact
operation, `guard approve` takes the actual `observation`, pending `id` and
`confirmation` quoting that authorization. One unchanged retry is permitted for
five minutes. Changed inputs and project-root deletion are not covered.

## Engines

`engine register` takes the verified installation `root` and the exact engine
manifest `sha256` printed by its build. The explicit installer handles this.
`engine browser -- goto <url>` passes arguments as separate process arguments.
JSON input can instead provide `args`, optional text `stdin` and `timeoutMs`.
Other capabilities: `render`, `design`, `design-md`, `design-detect`, `pretext`.
Engine execution returns `exitCode`, `stdout`, `stderr` and status. Parse the
engine's actual output inside stdout before asserting a functional result.

Image generation/editing uses the host's Codex image tool. `engine design` is local:
`compare --images a.png,b.png --output board.html`, `select --board board.html
--index 2 --reason "the user's actual choice"`, `selection --board board.html`,
`gallery`, `diff` and `prompt`. A comparison never invents a selection.

`design-md` and `design-detect` call separately installed Google DESIGN.md and
impeccable tools through the executable arrays in `BFS_DESIGN_MD_COMMAND` and
`BFS_IMPECCABLE_COMMAND`. No automatic installation occurs. See the engine README.
Google format support is optional and does not require Stitch. `design-md check`
maps to the external `lint` command; `tokens` maps to `export --format dtcg`.
Pretext returns the entry module of the separately installed npm package; use it
as an ES module or the project's installed package, not as an inline browser bundle.

## Delivery

- `delivery status`: Git head, branch, changes; optional explicit `remote`.
- `delivery queue`: explicit `host` (`github`/`gitlab`) and `repository`.
- `delivery version`: `current` and `bump` (`major`, `minor`, `patch`, or `micro`
  for a four-part version); returns a proposal, not a reservation.
- `delivery config`: `environment` and optional project-relative `file`;
  reads existing named environments, with command arrays for deploy/status/health.
- `delivery evidence`: `label`, `command` argument array, actual input `files`
  and optional timeout; records real process exit and before/after input identity.
- `delivery verify`: evidence `id`; reports whether it still matches.

Merge and deployment use the actual selected host/project commands after the
skill checks scope and live state. Reading a configuration never executes it.
