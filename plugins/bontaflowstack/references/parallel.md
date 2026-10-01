# Requested parallel execution

Use this procedure only for requested implementation of an accepted task graph.
Reuse the graph's acceptance source and the existing bfs-implement TDD procedure.
An independent task can use normal single-task implementation without orchestration.

1. Resolve the Git project, actual accepted base commit and task inputs. Run
   `tasks validate`, then explicitly `tasks create` once. Read `tasks status`.
   A dependency needs integrated, fresh evidence; completed claims do not release it.
2. Give each ready task a unique branch/worktree, native worker task and declared
   write scope. Create the worktree at `expectedBase` with the existing host Git
   tool. Start the worker's owned workflow there, then `tasks bind`. Shared catalog,
   CLI and registries have one owner; overlapping scopes run serially.
3. Worker: execute accepted TDD, verify outputs and finish its workflow. Commit only
   scoped changes. Run the actual focused check with `delivery evidence`, binding
   the input files and actual checked revision. `tasks record` selects that evidence,
   captures the clean commit and checks the worker's ownership and stable inputs.
4. Coordinator: inspect the recorded diff and exact commit; integrate one result
   into the selected integration branch using Git. Run relevant checks on that
   actual HEAD through delivery evidence and a new owned verification workflow.
   `tasks integrate` selects both verification and evidence. Only then inspect the
   recomputed readiness and start dependent work at its returned expected base.
5. A conflict, failed check, stale input or unavailable worker blocks the affected
   branch. Preserve original branches/worktrees and evidence. Never replace a user
   file, force-push or erase unrelated changes to manufacture a green integration.
6. Pause/load keeps each workflow and task record; recompute status against current
   Git and fingerprints. In a new chat in the same workspace, explicitly adopt the
   worker workflow first, then its task binding through `tasks adopt`. A coordinator
   adopts its plan without a task ID; historical evidence keeps its original owner.
   Query an uncertain external result before any retry.
   Task records and historical commands provide no authorization or automatic replay.

Use existing project memory for shared accepted decisions; guard/browser/workflow
state remains workspace-specific. A coordinator does not adopt another worker's
workflow to declare it complete. Local integration evidence is not publication,
main merge or deployment; use the separately requested bfs-prod-deploy step.
Remove only owned clean resources when cleanup itself is requested.

If a native sandbox uses another OS account, Git may reject the selected
coordinator worktree for ownership. Treat this as an explicit host prerequisite;
do not add global safe.directory entries or trust paths from stored metadata.
For an already verified, explicitly selected owned fixture/worktree, the host
may scope an exact safe.directory entry to that command or worker process.
Without that scoped access, report the Git error and keep dependent work blocked.
The host must also allow writes to the owned worktrees' shared Git metadata;
safe.directory does not grant filesystem access. A metadata permission failure
keeps the scoped edits and blocks commit/record; use an explicitly selected host
execution profile instead of silently changing OS ACLs.

## Request contract

All operations use JSON through the existing CLI `--input` boundary. `validate`
and `status` are read-only. `create`, `bind`, `record` and `integrate` explicitly
record local execution. `tasks list` discovers saved graph IDs without writes.
The core never spawns a worker or executes a merge.

`validate/create`: `plan` with `schema:1`, `planId`, `goal`, `acceptanceSource`,
optional exact current `baseRevision`, and `tasks`. Every task has `id`, `goal`,
`dependsOn`, `writePaths` (normalized relative file/directory paths), `inputs`,
`acceptance` and `verification` arrays. Inputs are stable consumed files, not
changed outputs. Git metadata and escaping paths cannot be write scopes.

`status`: `planId`; reports observed readiness and expected base per task.
`adopt`: `planId`, `confirm: "resume"`; optional `taskId` and `workflowId` select
an active worker binding whose workflow has already been adopted in this same
workspace. Without `taskId` it adopts the coordinator role. This explicitly
requested operation preserves old owners and historical result evidence.
`bind`: `planId`, `taskId`, `workflowId` from the worker's real native task.
`record`: `planId`, `taskId`, `summary`, `evidenceId` for its actual successful check.
`integrate`: `planId`, `taskId`, coordinator `workflowId` and `evidenceId` for the
actual integrated HEAD. Completed workflows and evidence must belong to the
corresponding native task/workspace and remain content-valid.

Reads preserve absent stores; malformed records fail visibly. Plans live in the
existing shared project state, protected by its atomic writer. A task ID is a local
graph identifier, not a fabricated GitHub issue or an execution permission.
