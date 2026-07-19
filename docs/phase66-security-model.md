# Phase 66 Security Model

Phase 66 is fail-closed.

- invalid rollout plans are rejected;
- rollout health failures pause deployment;
- rollback authorization requires a release ID, previous release ID, change ticket, and accountable operator;
- automated decisions are persisted as evidence;
- rollback execution must reference an authorized rollback ID;
- generated operational evidence remains outside source control.
