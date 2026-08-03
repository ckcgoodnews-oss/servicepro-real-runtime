---
title: "Branch Protection"
subtitle: "ServicePro product and operations documentation"
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

# Branch Protection

> **Operations and reference**
> ServicePro product and operations documentation

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Recommended GitHub branch protection for `main`:

- Require pull request before merging.
- Require approvals.
- Dismiss stale approvals.
- Require status checks to pass.
- Require branches to be up to date.
- Require conversation resolution.
- Restrict force pushes.
- Restrict deletions.

Required checks:

```text
Node runtime tests
Build API image
PostgreSQL migration smoke
```

Recommended merge strategy:

```text
Squash merge for sprint branches.
Merge commit only for coordinated release branches.
```
