# Phase 68 Operations Runbook

## Evaluate release risk

```powershell
npm run release:risk-evaluate
```

## Analyze deployment performance

```powershell
npm run release:performance-analyze
```

## Operating rule

Risk intelligence is advisory until the configured blocking threshold is reached. At or above the threshold, the release must be corrected, explicitly governed, or rejected.
