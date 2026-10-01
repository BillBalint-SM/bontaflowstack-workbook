# Prototype evidence contract

A prototype settles one explicit uncertainty. It does not certify production readiness.

Keep the experiment record small and complete:

```text
Question and decision:
Options:
Hypothesis and discriminating observation:
Disposable artifact path:
Run command and exit status:
Observed output and input identity:
Conclusion and limits:
User-selected option and source (if any):
Next authorized step:
```

Use a fresh, clearly disposable folder outside production source. Do not put credentials, real customer data or persistent state in it. Use synthetic/local fixtures. The normal project checks are unnecessary for throwaway code; the probe itself must run and expose the observation it was designed to discriminate. If setup fails or both options yield the same observable result, mark the answer inconclusive and report the blocker.

When selection occurs in a continuing authorized project workflow, save the accepted decision through its existing workflow step. Use project memory only for a decision meant to outlive that workflow, with its actual source and a concise stable key. A native selection is user-stated; a measured result is observed; a recommendation is inferred. Never merge these provenance types. Existing context export/import can carry the workflow and decision history when requested.

Only retain a prototype artifact when the user requests it. Retained artifacts stay on an isolated branch, with the selected decision pointing to the branch and commit. Production work starts from a selected decision translated into a specification or design; prototype files are not copied into product source by default.
