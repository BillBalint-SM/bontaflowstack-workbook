# Parallel implementation verification

## Result

The parallel task graph passed the local integration suite and a native two-worker Git/worktree run on Windows. The native run used separate Codex execution threads for B and C, recorded their real workflows and commits, merged them serially, and unlocked D only after both integrations and checks passed. No remote was configured or contacted.

## P-E: executable integration coverage

Command: `node --test tests/parallel.integration.test.mjs` — **6/6 passed** (148.9 s) after the final task-engine path comparison change. The suite creates isolated temporary Git repositories and checks:

- A integrates before B and C become ready; B and C use separate worktrees; D remains blocked until both are integrated.
- Overlapping scopes serialize, and the second worker commit has the current integration HEAD as its parent.
- A real merge conflict preserves the worker branch and coordinator data and leaves D blocked.
- A failed integration check does not integrate the result or release D.
- Dirty worker data survives and prevents task recording.
- The CLI returns valid JSON on stdout for accepted input and JSON errors on stderr with a failing exit for invalid input.

The independent engine suite also passed `node --test tests/task-graph.test.mjs` **6/6**, including CRLF-normalized tracked inputs, dirty tracked coordinator inputs, and Windows path comparison.

## P-N: native worktree run

The final preserved fixture is `C:\Users\littl\AppData\Local\Temp\bfs-pn-native-382b5e6bf0214906a1b52cd958051c42`. It records the frozen plugin, initial red results, worker JSONL transcripts, per-worker stderr/final/result files, coordinator results, task-plan state and Git history. The plan started at `e380a7f5f1a6a37704b22ec7655fb7021d9c5e4d`. Coordinator native task: `01a0f75d-7dfa-73e1-893a-67e0b850deb0`.

| Task | Native execution thread | Workflow | RED → GREEN | Worker commit | Prepare evidence |
|---|---|---|---|---|---|
| B | `01a0f78a-9b14-74e1-8add-688606a8f7dc` | `b954d382-0371-4d92-be05-201a14160d80` | `node tests/b.test.mjs`: exit 1 (`TODO !== B`) → exit 0 (`B behavior passed`) | `ed9a686a39c5e97d1ade1be34bd3ec70070b6cef` | `0bc2864e-753c-4333-b933-a9fccc93368c` |
| C | `01a0f78a-9b01-7eb0-a913-b8fe1b942950` | `1ea540f6-ab36-4ad9-98b2-9eea29cd6da5` | `node tests/c.test.mjs`: exit 1 (`TODO !== C`) → exit 0 (`C behavior passed`) | `3bc3a607f34662ab71763ab1f05f6099ece14db6` | `90ce0456-ac35-440b-93db-02244dd76e56` |

Both workers changed and committed only their declared source file. Their recorded plan statuses are `integrated`; their post-commit worktrees are clean.

The coordinator merged B first at `7ac6076249a63053efcf6b96f70e3fcb5939b876` and recorded integration evidence `502c2b38-46d8-4541-a619-b939b327e618` (`node tests/b.test.mjs`, exit 0). It then merged C at `b0c5e3a84e9d873198f427112f058bf475674949` and recorded evidence `8d5318bc-3ebc-4cf2-af49-04ab6270760b`; its command separately executed B, C and the combined assertion scripts, all with exit 0. D changed from blocked to ready only after these checks.

An initial D evidence command mistakenly passed all three scripts as arguments to a single `node` invocation, which executed only B. That evidence (`10aa93a3-94f0-4454-baa6-94efa86d0ad1`) is retained in the raw history but is superseded and is not counted as acceptance. D was rechecked with the actual combined test: `node tests/combined.test.mjs`, exit 0, stdout `B+C integrated check passed`; corrected evidence is `1469619b-b9ed-440f-8a48-cca148288dc1` at the integrated HEAD. D remains a ready verification gate, as specified by the graph.

The final fixture repository is clean at `b0c5e3a84e9d873198f427112f058bf475674949`. The frozen plugin hash-map digest is `68807ee3dc85e65ce6bf58a87605533e26bbb9cd6884d04b20a67b90bf1e684a`; the frozen plugin did not change during worker execution. The `core/tasks.mjs`, CLI and `bfs-implement` hashes matched the tested source at run time. The parallel reference was subsequently updated to document the Windows fixture prerequisites, so the full text package is not byte-for-byte identical to that earlier frozen copy.

## Diagnosed environment failures and recovery

Two native preflight failures exposed Windows-specific setup requirements. First, Git emitted a forward-slash common-directory path while the context anchor used backslashes; strict string comparison rejected the same path. The engine now uses platform-aware path comparison, covered by its regression test. Second, Codex's workspace-write worker ran under `CodexSandboxOffline` while the parent-created temporary repository was owned by `Agentic_PC/littl`; Git refused the coordinator lookup as dubious ownership. Exact per-process `GIT_CONFIG_COUNT` entries were added only for the owned fixture repository and that worker's worktree. No global Git configuration, wildcard, persisted safe-directory entry, or ACL was changed.

Workspace-write then allowed source edits but denied writes to the worktree's shared Git metadata (`.git/worktrees/<name>/index.lock`). The workers stopped without losing the RED/GREEN evidence or changing HEAD. The same actual native threads resumed with `danger-full-access` restricted to this disposable fixture continuation; only then could they commit their already-scoped changes. No new worker identity or worktree was substituted.

The first two failed fixture histories are preserved separately at:

- `C:\Users\littl\AppData\Local\Temp\bfs-pn-native-c0348b74484d421aa2979289c81f5b34` — path-format mismatch and read-only diagnosis.
- `C:\Users\littl\AppData\Local\Temp\bfs-pn-native-00b8048eee6246109c3843ccec556cfb` — path fix revealed the native sandbox ownership boundary.

These are capability/setup failures in the native test harness, not a reason to loosen the product's ownership validation or trust arbitrary coordinator paths.
