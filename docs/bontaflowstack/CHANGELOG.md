# Changelog

## 0.5.0 — 2026-09-30

- Added the `question-presentation` preference: `prefer-panel` (with chat fallback) or `chat`, using existing user/project/task preference storage.
- Conversational setup offers the choice after technical checks when no effective choice exists; unanswered questions do not block setup or save a default.
- All skills load effective preferences once per chat; `bfs-plan-tune` can change/reset the presentation and refresh it for subsequent questions.
- Shortened all 29 skills and synchronized descriptions with the catalog. Shared instructions define accepted basis, checkpoint, evidence and waiting; optional capability, guard and delivery details load through conditional references.
- Reduced combined instruction text from 11127 to 9921 words (10.8%), counting the relocated reference text. This measures text size, not runtime cost or latency.
- Clarified mode-specific memory and deployment steps, removed duplicate output requirements, and checked local reference links and section anchors.
- Fixed setup to read the guard reference before any technical checks, including core-only setup. Missing capabilities no longer suppress questions about required task inputs.
- Validation: 35 automated checks, 19 matched native A/B cases, two desktop setup chats with human panel/chat answers, and five focused sessions for the follow-up fixes. See [native results and limits](NATIVE-ACCEPTANCE-REPORT.md).
- Native guard enforcement, actual provider deployment and the remaining manual cases are not certified by those runs. After updating, start a new chat and review changed hook definitions through Codex's native trust interface when requested.

## 0.4.1 — 2026-09-30

- Fixed the successful ZIP smoke check's process exit code. The expected missing-browser check no longer leaves exit code 1 for the Windows CI shell wrapper.
- Supersedes 0.4.0 without changing its published tag or assets.

## 0.4.0 — 2026-09-30

### Added

- Independent QA action (`inspect` or `fix`) and coverage (`quick`, `full`, `regression` or `diff`), including compatible reading of older settings.
- A manual agent acceptance guide and repeatable project fixtures.
- Clean-checkout release builds, ZIP integrity and extracted-entrypoint checks, and Windows CI coverage for the release package.
- A local-data guide covering inspection, exports, backups and targeted removal.

### Fixed

- Workflow continuation now accepts the latest file output certified by a later completed step while retaining earlier evidence.
- Concurrent hooks recheck observation freshness under the lock; identical state writes are skipped.
- Read-only Git status checks avoid unnecessary command-warning overhead.

### Changed

- Direct, scoped implementation requests count as acceptance; material changes still require a user decision.
- Repeated skill reads can reuse HOST rules already loaded in the same chat using their SHA-256 hash.
- Catalog checks validate skill descriptions, aliases, routes and QA settings without separately maintained counts.

### Validation and limits

- The implementation passed 33 automated checks, ten manual agent scenarios, repeated setup checks in three projects, and all five workflow routes. The manual publication scenario used a local command substitute.
- Optional browser-engine session and navigation timeouts remain a known limitation. Some browser acceptance checks used Chrome or the Codex in-app browser; this does not certify every optional-engine integration.
- After updating the plugin, start a new chat to load the new instructions. If Codex requests hook trust, review it through `/hooks`; installation does not grant that trust.
