# Phase 69 Operations Runbook

## Simulate release policy

```powershell
npm run release:policy-simulate
```

## Generate control recommendations

```powershell
npm run release:controls-optimize
```

## Governance rule

Optimization recommendations must never modify active controls automatically. A named approver and approval reference are required before creating and activating a new policy version.
