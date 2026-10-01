---
name: bfs-prod-deploy
description: "Inspect, integrate or deploy a selected change and verify delivered revision and health."
---

# BFS Prod Deploy

Load [HOST.md](../../HOST.md) via `read bfs-prod-deploy`; follow its hash-based read protocol.
Modes: `inspect` for readiness, `integrate` for merge, `deploy` for delivery, `verify` for revision/health checks. Default: `inspect`.

## Common checks

1. Resolve repository/change, exact head/base, environment and requested operation. Read existing deployment instructions/config; report missing targets, credentials or configuration.
2. Inspect integration method, automatic/manual deployment trigger, status/health checks and recovery. Configuration supplies no permission. Check CI/review/test evidence against current content; distinguish pending, failed, stale and missing results.
3. Execute only the requested mode. For an integration/deployment sequence, use separate integrate, deploy and verify workflow steps; save each observed stage immediately. Deploy-only starts at deployment.
4. Bind each delivery evidence record to the owned workflow, stage and exact subject. Derive the report from those records. Use an explicitly selected current read-only provider query for delivery verify; distinguish its fresh observation from historical evidence and compare actual revision/version/artifact identity before claiming success.

## Inspect

Report readiness without merging or triggering deployment.

## Integrate

Immediately recheck actual head/base, use the requested host operation and confirm returned remote state; queued is not merged.

## Deploy

Observe automatic delivery before any manual trigger. For requested manual deployment, use the verified command/environment. Report no-deploy projects explicitly. Observe deployment with bounded waits and verify revision/version and configured health.

## Verify

Inspect delivered revision/version and configured health conditions without triggering deployment. Use bfs-qa for requested web-flow checks.

On ambiguous failure, inspect remote state before retrying. Record failed stage, identifiers and diagnostics; propose scoped recovery and execute rollback only when requested. This skill consumes existing configuration; provisioning/config generation remains outside scope.

Output: Readiness for inspect, or separate requested-stage results with actual links and remaining blockers.

## References

- [delivery](../../references/delivery.md): before readiness checks, integration, deployment or verification.
- [commands](../../references/commands.md#delivery): before constructing delivery requests.
