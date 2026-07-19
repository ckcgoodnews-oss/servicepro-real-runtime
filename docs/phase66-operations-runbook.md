# Phase 66 Operations Runbook

## Create rollout

```powershell
npm run release:rollout-create
```

## Advance rollout

```powershell
npm run release:rollout-advance
```

## Evaluate rollback

```powershell
npm run release:rollback-evaluate
```

A paused rollout should not be manually forced forward. Correct the failing health condition or execute an authorized rollback.
