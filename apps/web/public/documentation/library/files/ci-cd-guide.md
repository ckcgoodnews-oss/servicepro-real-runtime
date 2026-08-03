---
title: "CI/CD Guide"
subtitle: "Workflows"
document_type: "Operations and reference"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# CI/CD Guide

> **Operations and reference**
> Workflows

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Workflows

Sprint 72 adds three GitHub Actions workflows.

```text
.github/workflows/ci.yml
.github/workflows/docker-build.yml
.github/workflows/postgres-smoke.yml
```

## CI workflow

Runs on pushes and pull requests to `main` and `develop`.

Checks:

```powershell
npm install
npm run migrations:check
npm test
```

## Docker build workflow

Runs on pull requests and release tags.

Checks:

```powershell
docker build -t servicepro-api:<sha> .
docker image inspect servicepro-api:<sha>
```

## PostgreSQL smoke workflow

Starts PostgreSQL, runs migrations, and seeds services.

## Branching model

Recommended:

```text
main        production-ready
develop     integration branch
sprint-##   sprint patch branch
hotfix/*    emergency fix branch
```

## Required branch protection

Enable these required checks before merge:

```text
Node runtime tests
Build API image
PostgreSQL migration smoke
```
