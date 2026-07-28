# ServicePro 8.0.0-alpha.1 — Known Limitations

These items are explicitly **not certified**, rather than silently treated as passing:

1. **Live hosting:** No Render or Cloudflare production deployment was performed. DNS, TLS, platform IAM, production origins, managed-service networking, and live rollback remain environment gates.
2. **External payment settlement:** Invoice payment application and persistence are certified; live Stripe/provider authorization, settlement, webhook delivery, disputes, and reconciliation were not exercised.
3. **Redis-backed behavior:** Redis 7.4.10 connectivity was verified. The current runtime contains no active Redis client integration, so cache, queue, or distributed-lock behavior cannot be certified as an application feature.
4. **External dependency audit:** Root installation reported zero vulnerabilities and the frontend offline audit reported zero. An online frontend registry audit was not performed because it would transmit package metadata outside the workspace without explicit approval.
5. **Scale and resilience:** This cycle did not execute sustained load, multi-region failover, chaos, or long-duration soak tests.
6. **Broad device matrix:** Browser validation covered the local in-app Chromium surface at desktop and 390×844 mobile dimensions, not every supported browser/OS/device combination.
7. **Alpha designation:** Passing this certification establishes deployability and core workflow integrity; it does not convert an alpha release into a general-availability support commitment.
