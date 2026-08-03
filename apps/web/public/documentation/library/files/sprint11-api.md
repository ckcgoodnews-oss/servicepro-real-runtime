---
title: "Sprint 11 API Documentation"
subtitle: "Authentication"
document_type: "Sprint documentation"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Sprint 11 API Documentation

> **Sprint documentation**
> Authentication

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Authentication

Use a bearer token:

```http
Authorization: Bearer sp_xxxxxxxxx
```

## Scopes

```text
customers.read
customers.write
jobs.read
jobs.write
services.read
*
```

## Endpoints

```text
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/jobs
POST   /api/v1/jobs
PATCH  /api/v1/jobs/:id
GET    /api/v1/services
```

## Webhook events

```text
customer.created
job.created
job.updated
```
