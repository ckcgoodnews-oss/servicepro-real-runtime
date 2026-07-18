# Sprint 761 — Governed Quarantine Override

## Purpose

Sprint 761 adds a controlled emergency override path for releases blocked by Sprint 760 quarantine enforcement.

## Required controls

An override is authorized only when all of the following are valid:

- the request targets the active quarantine identifier;
- a change-management ticket is supplied;
- the justification contains meaningful detail;
- the request has not expired;
- at least two distinct people approve;
- one approval is from a release manager;
- one approval is from security or SRE.

Duplicate approvers do not satisfy dual-control requirements.

## Exit behavior

```powershell
npm run release:override-check
```

The command exits with code `4` when authorization is denied.

Local verification uses:

```powershell
node scripts/check-release-quarantine-override.js --allow-denied
```

because no production override request is expected in a development checkout.

## Input file

Default path:

`release-evidence/release-quarantine-override-request.json`

Example:

```json
{
  "quarantineId": "replace-with-active-quarantine-id",
  "changeTicket": "CHG-1001",
  "justification": "Emergency mitigation with documented rollback and monitoring.",
  "expiresAt": "2026-07-19T12:00:00.000Z",
  "approvals": [
    {
      "approver": "release.manager@example.com",
      "role": "release-manager",
      "approvedAt": "2026-07-18T12:00:00.000Z"
    },
    {
      "approver": "security@example.com",
      "role": "security",
      "approvedAt": "2026-07-18T12:01:00.000Z"
    }
  ]
}
```

## Output evidence

`release-evidence/release-quarantine-override-authorization.json`

Generated evidence is environment-specific and must not be committed.
