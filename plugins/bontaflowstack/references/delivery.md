# Delivery checks

Follow the project's checks and version policy. Bind review/test evidence to the
checked content; invalidate affected results when inputs change. Inspect remote
head/base immediately before integration. Local version arithmetic reserves nothing.

Reuse valid deployment configuration. Missing configuration is a prerequisite,
not authorization to provision infrastructure. Observe existing automatic delivery
before manually triggering deployment. Inspect remote state before retrying an
uncertain external action; a failed checkpoint save alone never justifies retry.

Report preparation, commit, push/PR, merge, deployment and revision/health
verification separately with actual results and links. Publication, deployment,
spending, destruction and rollback require the user's applicable request.

Read [commands](commands.md#delivery) when constructing a delivery core request.

## Evidence and freshness

`delivery evidence` runs the selected argument-array command against actual
input files. Add `workflowId`, `stage` (prepare/publish/integrate/deploy/verify)
and `subject`: required `target` and `sourceRevision`; optional `repository`,
`provider`, `change`, `revision`, `version`, `artifactSha256`. Use actual
identities, including differing PR head, merge result and deployed revision.
Persisted stdout, stderr, exit code and fingerprints are the evidence source.

External stage queries should print one JSON object:

```json
{"status":"completed","provider":"github","target":"release:v1.0.0","revision":"<observed-commit>","version":"1.0.0","artifactSha256":"<observed-sha256>","reference":"<actual-url>"}
```

Status may be completed, pending, unknown or not-applicable (with reason).
Only include fields actually observed. Provider query unavailable, plain URLs
or command success without structured identity leave verification unknown.
Select at least one expected revision, version or artifact hash for successful
external verification; a completed status without that identity stays unknown.
For a local-only project, report external stages as not requested; for a
requested stage that cannot apply, record its observed reason.

`delivery report` takes workflowId, subject and requested `stages`. It selects
the newest record per stage, including a later failure/pending result. Missing,
failed, stale and mismatched results stay visible. Reporting is read-only and
never claims live verification. Existing evidence without stage remains usable
through its original local verification interface.

`delivery verify` takes evidence id and an explicitly chosen current `command`
for an external stage. It writes a fresh probe with the original input baseline;
changed source stays stale even when the remote query succeeds. A matching
completed probe is live verification at its recorded time. Saved commands are
never replayed implicitly. A remote success followed by a failed evidence save
requires a fresh status query before retrying any external operation.
