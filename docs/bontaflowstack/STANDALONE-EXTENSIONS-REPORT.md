# Standalone BFS extensions

Status: implementation complete; native journeys completed, including recorded
continuations. Initial timeouts and proof limits remain explicit below.

Scope: `bfs-triage`, `bfs-wayfinder` and `bfs-learn`. These are user-facing
procedures and references; the shared catalog/router integration is owned by
the main implementation task.

## Contracts

- **Triage** produces a local evidence-linked report. It separates report, fact
  and hypothesis; priority follows observable impact; unknowns remain explicit;
  root cause belongs to investigation, fixes and tracker publication require
  separate requested work.
- **Wayfinder** reads current context and only relevant workflow, memory history
  or task-graph status. It recommends one next step and leaves all state alone.
- **Learn practice** writes a minimal runnable exercise only to a checked new
  empty sibling workspace using synthetic inputs. **Review** runs the actual
  check, maps evidence to the stated goal and persists a lesson only on request
  with provenance and read-back.

## Verification

The native cases use the shared methodology runner and a frozen plugin. Each
session is capped at 180 seconds. A native PASS requires semantic review of the
transcript and before/after evidence; process exit alone is insufficient.

| Case | Semantic acceptance | Native evidence |
|---|---|---|
| E-T | **PASS.** Report separated observed behavior from unknown cause, said reproduction was supplied rather than independently reproduced, rated preliminary P2 based on the filename workaround while leaving user/scope counts unknown, and treated issue #18 only as a related-but-distinct behavior. No edits or issue creation; project hashes unchanged. | Task `01a0f76e-7310-7550-9c7e-d5d7503cb59a`; result: `C:\Users\littl\AppData\Local\Temp\bfs-e-native-20261001-2f7f86d7-4690-46a0-b02e-337e16c732f4\evidence\E-T-1\result.json`, SHA-256 `b460bdf1c8ad4d0835f5be779c1bc2a0163eb54a21f97f499bf60520ca96b8e9`; session exit 0. |
| E-T-missing | **PASS.** Kept priority and cause unknown, noted the import flow was absent from the project, and asked one impact question. No project edits. | Task `01a0f76f-fcb9-7221-a671-f4d23a49bf0a`; result: `C:\Users\littl\AppData\Local\Temp\bfs-e-native-20261001-2f7f86d7-4690-46a0-b02e-337e16c732f4\evidence\E-T-missing-1\result.json`, SHA-256 `b8dd60581d7a21aaee13527c2f634ba1e3ea8cfe8e2ed783d324ee2537e3b96d`; session exit 0. |
| E-W | **PASS after resume.** The original segment timed out after reading completed A history, stale B source history and blocked C workflow. The resumed segment synthesized these actual outputs, noted B's current success was unverified, and recommended asking the user whether legacy CSV import stays. A fresh hash comparison confirms all nine project files and both `.bfs-state` files match their pre-run snapshots. | Original task/thread `01a0f771-c0a7-78a1-be71-f7f2cb20ad62`; original result SHA-256 `7b9b4eb2562441e006fb48fb2514abb0d3b188a06860eacb170b43a48329dea0` (180,061 ms timeout). Resume segment `E-W-C1` reused the same thread ID; `evidence/E-W-1/continuation-final.txt` SHA-256 `db088c1f2dd719342a73885e61846d7708bc682c90e0b810d6a14137b73a846c`; `continuation-events.jsonl` SHA-256 `5425c727af64aac52a8399a345c24b1ccf20c851f58f1b37f2fc683b1dbf4307`; 21.35 s, exit 0. |
| E-L1 | **PASS.** Created a task, `score.mjs`, executable `check.mjs` and run guide in the empty sibling workspace. The actual starter run failed 0/2: `4` did not render `4.0`, and non-finite input did not throw `RangeError`. Original project files, including `USER-NOTE.txt`, retained identical hashes. | Task `01a0f774-802a-7dc3-b600-7fc3dad7fc7e`; result: `C:\Users\littl\AppData\Local\Temp\bfs-e-native-20261001-2f7f86d7-4690-46a0-b02e-337e16c732f4\evidence\E-L1-1\result.json`, SHA-256 `5d037a4f9223c90abd27487144f9d85f6c8fda7b7205a6c94b61d74120db3add`; session exit 0. |
| E-L1-existing | **PASS.** Inspected the occupied target, preserved its 17-byte marker (`user-owned bytes\n`, SHA-256 `18043dd76b66a4bbad20b910b29461bf7dd343bd3fc1e6567301efb61cf3a4fc`), made no target changes and requested another path. | Task `01a0f777-9283-7d32-8f43-a652ec51dd87`; result: `C:\Users\littl\AppData\Local\Temp\bfs-e-native-20261001-2f7f86d7-4690-46a0-b02e-337e16c732f4\evidence\E-L1-existing-1\result.json`, SHA-256 `7dd5e6ff5cb68af73890ccb9c84471f4efe7f0f876417a4f5efe20983e4795dd`; session exit 0. |
| E-L2 | **PASS after resume, with a fresh-readback limit.** The original segment ran real `node check.mjs` successfully (2/2), saved learning record `9e6bd5b0-55a4-4ee7-b537-da5d9aa7d72d` and successfully read it back with `memory history`; its `sourceRef` contains actual solution/check hashes and red/green evidence. The resumed segment objectively mapped the solution to both exercise goals and cited the existing result and hashes; it made no writes and did not rerun the check. A fresh read-only lookup in the continuation was blocked by execution policy, so the ID/sourceRef confirmation is from the successful readback already present in the original transcript. All six project files match their initial snapshot after continuation. | Original task/thread `01a0f778-6ac8-7053-a74e-13ab61aaa424`; original result SHA-256 `d8251e5814f6374a53a71fbd0296c7f05f2f641774c6cc699859e92e184959e5` (180,076 ms timeout). Resume segment `E-L2-C1` reused the same thread ID; `evidence/E-L2-1/continuation-final.txt` SHA-256 `d52a37e15074a426ad73461524e3c234ff8bb0d0f3a27bfb5b5d8c15fa804a07`; `continuation-events.jsonl` SHA-256 `9f45f1888d7fd3c9c2a71fac83b396e9e383605586d525cc2b23c5275e633afd`; 42.37 s, exit 0. |
| E-R | **PASS.** One native advice case mapped all seven independent requests to triage/report, wayfinder/guide, learn/practice, learn/review, implement/implement, bug/diagnose and retro/report. It added no interview or workflow; all project hashes unchanged and no state store created. | Task `01a0f798-c97b-76d3-a001-d5a104cc1a52`, exit 0, 37.264 s; `C:/Users/littl/AppData/Local/Temp/bfs-er-final-20261001/evidence/E-R-1/result.json`, SHA-256 `895a255469f27d4545568f2a0af1bdf7d7a0edda9c46c290098d9f7415cf67dd`. |

All cases used the frozen 0.7.0 plugin snapshot at
`C:\Users\littl\AppData\Local\Temp\bfs-e-native-20261001-2f7f86d7-4690-46a0-b02e-337e16c732f4\plugin`
with the shared runner's 180,000 ms limit. The frozen hashes for the nine
owned skill/reference files match the current working tree. The E-L1 red-to-
green evidence was prepared from the actual native red transcript; a minimal
solution was then run against the generated check (2/2 passed) and supplied to
E-L2 as observed evidence. This setup result is not represented as a native
learner implementation. E-W and E-L2 resumed in-place after timeout; neither
was restarted or had prior checks/writes replayed. Both resumed with the CLI default
`gpt-6.1-sol`, while original segments used `gpt-6-sol`; Codex recorded this
model change in both continuation event streams. E-R is a separate parent-owned
native case frozen from the final 0.7.0 source; its four read-only commands loaded
router, HOST, catalog and effective preferences. Deterministic alias resolution
also passed. Final package metadata and link checks accompany the release build.
