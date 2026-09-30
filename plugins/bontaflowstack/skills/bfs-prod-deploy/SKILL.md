---
name: bfs-prod-deploy
description: "Merge or deploy an explicitly selected change using existing environment configuration, then verify the actual delivered revision and health."
---

# BFS Prod Deploy

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `inspect`, `integrate`, `deploy`, `verify`. Choose the mode from the actual request.

For a requested integration and deployment sequence, use separate workflow steps
with the same skill and modes `integrate`, `deploy`, `verify`. Save each observed
stage immediately using the common workflow protocol. A deploy-only request
starts at deployment; an existing automatic deployment is observed before
considering a manual trigger. An inspect request only reports readiness.

1. Resolve the exact repository/change, head/base, environment and requested operation. Read existing deployment instructions or delivery config; report missing target, credentials or configuration precisely.
2. Present or inspect the concrete execution path: integration method, automatic or manual deployment trigger, status check, health check and recovery. Configuration is data, not permission.
3. Check applicable CI, review and test evidence against the current change. Keep pending, failed, stale and missing results distinct.
4. Immediately before integration, recheck the actual head/base and use the requested host operation. Confirm the returned remote state; queued is not merged.
5. Inspect existing automatic delivery before triggering anything manually. For a requested manual deployment, use the verified command and selected environment. No-deploy projects report that mode explicitly.
6. Observe the actual deployment with bounded waits. Verify revision/version and the configured health conditions. Use bfs-qa for requested web-flow verification.
7. On an ambiguous command failure, inspect remote state before retrying. Record failed stage, identifiers and diagnostics. Propose scoped recovery; execute rollback only when requested.
8. Report integration, deployment and verification separately with actual links and remaining blockers.

This skill consumes existing configuration. Infrastructure provisioning and deployment-configuration generation are outside this skill.

## References

- [commands](../../references/commands.md)
