# Sprint 152 - Privacy Case Orchestration

Sprint 152 adds jurisdiction-aware DSAR deadlines, verification evidence, fulfillment tasks, deadline extensions, subject communications, escalations, and operational metrics.

## Endpoints to wire

```text
POST /api/v1/privacy/cases
POST /api/v1/privacy/cases/:id/verify
POST /api/v1/privacy/cases/:id/extend
POST /api/v1/privacy/cases/:id/close
POST /api/v1/privacy/case-tasks
POST /api/v1/privacy/case-tasks/:id/complete
POST /api/v1/privacy/case-communications
GET  /api/v1/privacy/case-metrics
```

Register `privacyCaseOrchestrationRepository` in the cumulative repository factory and protect endpoints with privacy read/write permissions.
