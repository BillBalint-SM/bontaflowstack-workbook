# Changelog

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
