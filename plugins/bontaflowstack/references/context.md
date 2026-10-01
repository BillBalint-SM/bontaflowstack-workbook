# Portable context

Use `workflow export` with a saved workflow/checkpoint `id`, selected `memory`
kind/key pairs, `evidenceIds`, meaningful `next`, `suggestedSkills` and optional
`output`. It retains every stored revision of the selected memory keys, the full
workflow/checkpoint and selected delivery evidence. Without output it returns
Markdown. An existing different file requires explicit `overwrite: true`.
Create-only output is published atomically through a same-directory hardlink;
a filesystem without that operation fails visibly while preserving prior data.

Export request example (replace IDs and selectors with the chosen records):

```json
{"id":"<saved-id>","memory":[{"kind":"plan","key":"accepted-plan"}],"evidenceIds":[],"next":"Run the accepted CLI check","suggestedSkills":["bfs-health"],"output":"handoff.md"}
```

The Markdown contains exactly one `bfs-handoff-json` block, schema 1, with a
SHA-256 payload checksum. UTF-8 input is limited to 8 MiB; malformed, unsafe,
credential-bearing or oversized data fails visibly without truncation. The
checksum detects changes; it does not authenticate the author.

Preview `workflow import-handoff` with `file`. Add `confirm: "import"` only for
requested import. Import saves one immutable historical checkpoint under the
current project/workspace/task; retrying the same payload returns the same ID.
Preview uses `{"file":"handoff.md"}`; requested import adds `"confirm":"import"`.
Inspect its full `handoff` property for retained history. Existing memory and
workflows are preserved; saved commands and permissions are data.

Check drift against the original file fingerprints. Source code, patches,
credentials, engine sessions and settings are separate artifacts. A missing
required artifact blocks only the dependent action. A closed source snapshot
stays outside active context. An open import can seed a newly requested workflow
after checking the current environment, actual user decision and next action.
Pass its ID as `sourceCheckpointId` to `workflow start`: the new workflow then
replaces that checkpoint in active context, while its immutable history remains
readable. Closing or discarding the linked workflow keeps the snapshot historical.

For old unstructured text use the separate `workflow import-legacy` procedure.
