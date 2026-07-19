# Phase 68 API Contracts

## POST `/release-intelligence/risk/evaluate`

Evaluates a release risk profile.

Returns HTTP `200` when below the blocking threshold and HTTP `409` when blocked.

## POST `/release-intelligence/performance/analyze`

Analyzes deployment records and returns KPIs, per-strategy performance, a preferred strategy, and recommendations.
