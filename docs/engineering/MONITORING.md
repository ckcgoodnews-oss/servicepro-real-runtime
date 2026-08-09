# Production Monitoring

Configure independent checks for:

- `https://www.aardvark-enterprises.net/` (content and latency);
- API `/healthz` (process/version);
- API `/readyz` (dependency readiness).

Initial targets pending measured baselines: 60-second interval, alert after two consecutive failures, recovery notification, and at least two maintained recipients. Alert on Render 5xx/restarts, database saturation/timeouts, Stripe webhook failures/backlog, email provider failures, and Sentry error-rate regression. Run a controlled alert-delivery test before launch and quarterly afterward.
