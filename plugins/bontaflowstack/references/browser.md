# Shared browser usage

Inspect installed capability readiness using `doctor bfs-browse`. Commands run as
`engine browser -- <command> <arguments>` or JSON `args` through the common CLI.
Read the actual `--help` output before using an unfamiliar command or flag.

Useful operations:

| Need | Commands |
| --- | --- |
| Read a page | `goto`, `snapshot`, `text`, `html`, `links`, `data` |
| Interact | `click`, `fill`, `select`, keyboard/scroll commands from help |
| Inspect | `console`, `network`, `js`, `eval`, accessibility/DOM commands |
| Capture | `screenshot`, `responsive`, `pdf` |
| Measure | `perf`, bounded page expressions |
| Session | `tabs`, `newtab`, `tab`, `closetab`, `connect`, `handoff`, `resume`, `stop` |

Element references come from fresh snapshots. Re-read after navigation or
changes that replace the DOM. Capture and view real screenshots when checking
visual output. Keep errors separate from extracted datasets.

Visible sign-in uses the engine's documented connect/handoff/resume path. The
user enters credentials in the browser; the agent verifies access afterwards.
The core supplies project/task-specific state and profile locations.

One-time page expressions and extraction files are supported. Stored reusable
browser-script discovery, generation and execution are removed.
For a request for that removed BFS feature, report it as unsupported. Do not
substitute a saved console script, test program or invented skill. Offer a
separate coding approach only as an option; create it when the user explicitly
requests that alternative outside the removed BFS workflow.

Use `engine render` for local HTML: pass the file followed by `--screenshot`
and `--width`/`--height` options as shown by its `--help`. Inspect the resulting
file, dimensions and content. Engine CLI success alone is not visual acceptance.

Leave unrelated user tabs and processes intact. Stop only resources whose
ownership has been established for this task.
