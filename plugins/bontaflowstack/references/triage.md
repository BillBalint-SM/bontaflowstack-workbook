# Triage report contract

Triage converts a report into a bounded work item. Keep the user's wording and
source visible so later investigation can distinguish the report from analysis.

## Required fields

- **Observed:** exact expected/actual behavior and environment, with source.
- **Reproduction:** shortest supplied or safely executed steps; mark unavailable
  steps as missing rather than inventing them.
- **Impact:** affected users and journey, scope, workaround, and evidence. Unknown
  scope stays unknown.
- **Priority:** P0 data loss/security/service outage; P1 primary journey blocked;
  P2 workaround exists; P3 limited impact. Name the impact fact supporting it.
- **Related work:** identify a duplicate only when the behavior and evidence match;
  otherwise label it a possible relation or leave it unknown.
- **Analysis:** keep observed facts, user-reported facts and hypotheses separate.
  A root cause requires reproducing evidence or source-level proof.
- **Next route:** one concrete next skill and why. Use investigation for unknown
  cause, spec for a missing requirement, implementation only for an accepted repair.

If a missing fact could change priority or the next action, ask for that fact and
leave the affected field unresolved. Keep the report local; tracker publication
is a separately requested action.
