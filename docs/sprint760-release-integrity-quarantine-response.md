# Sprint 760 — Release Integrity Quarantine Response

## Purpose

Sprint 760 converts the Sprint 759 release-integrity monitoring result into an enforceable deployment quarantine decision.

## Behavior

The control quarantines a release when any of the following is true:

- health is `critical`;
- release integrity status is `drifted`;
- the upstream control is fail-closed.

When quarantined, the generated response instructs operators and automation to:

- block deployment;
- block promotion;
- require operator review;
- prevent traffic shifting.

A transition from a quarantined state to a valid aligned state is recorded as `recovered`.

## Commands

```powershell
npm run test:sprint760
npm run release:quarantine-check -- --allow-quarantined
```

Strict execution exits with code `3` while quarantined.

## Evidence files

- `release-evidence/release-integrity-quarantine-report.json`
- `release-evidence/release-integrity-quarantine-state.json`

Generated evidence is environment-specific and should not be committed.
