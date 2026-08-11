# Production Environment Variable Contract

Never commit live values. Variables prefixed `NEXT_PUBLIC_` are browser-visible and must never contain secrets.

| Variable | Component | Required in production | Secret | Source / purpose | Rotation or verification |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | API/web | Yes | No | Set to `production` | Verify health/build metadata |
| `APP_VERSION` | API | Yes | No | Release version or commit | Compare `/healthz` to deployed SHA |
| `DATA_STORE` | API | Yes | No | Must be `postgres` | `/readyz` reports database readiness |
| `DATABASE_URL` | API | Yes | Yes | Supabase connection/pooler URI | Rotate DB password, update Render, smoke, revoke old |
| `DATABASE_SSL` | API | Yes | No | Require TLS (`true`) | Connection succeeds over TLS |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | API | Yes | No | Verify server certificate; default `true` | Do not disable without documented CA reason |
| `DATABASE_POOL_MAX` | API | Yes | No | Per-instance pool ceiling | Size against Supabase/pooler limits |
| `DATABASE_CONNECTION_TIMEOUT_MS` | API | Yes | No | Pool acquisition timeout | Outage test fails promptly |
| `DATABASE_IDLE_TIMEOUT_MS` | API | Yes | No | Idle connection lifetime | Observe pool behavior |
| `DATABASE_STATEMENT_TIMEOUT_MS` | API | Yes | No | Server statement limit | Slow-query test is cancelled |
| `DATABASE_QUERY_TIMEOUT_MS` | API | Yes | No | Client query limit | Slow-query test is cancelled |
| `JWT_SECRET` | API | Yes | Yes | Access-token signing | Controlled rotation; current code lacks previous-secret support |
| `PORTAL_TOKEN_SECRET` | API | Yes | Yes | Portal-token signing | Rotate and invalidate old portal sessions |
| `CORS_ALLOWED_ORIGINS` | API | Yes | No | Exact comma-separated HTTPS origins | Positive and negative preflight checks |
| `EMAIL_FROM` | API | When email enabled | No | Verified sender identity | Delivered message passes SPF/DKIM/DMARC |
| `FEATURE_EMAIL_ENABLED` | API | Yes | No | Enables real Resend delivery | Must be `true` only after provider verification |
| `RESEND_API_KEY` | API | When email enabled | Yes | Resend server API | Rotate in Resend/Render and revoke old |
| `APP_BASE_URL` | API | Yes | No | Canonical application origin used in email links | Verify reset and trial links |
| `STRIPE_SECRET_KEY` | API | When payments enabled | Yes | Stripe server API | Rotate in Stripe/Render; never use `NEXT_PUBLIC_` |
| `STRIPE_WEBHOOK_SECRET` | API | When payments enabled | Yes | Stripe endpoint signature | Roll endpoint secret and verify signed event |
| `NEXT_PUBLIC_API_BASE_URL` | Web | Yes | No | Canonical public API origin | Inspect built assets and browser traffic |
| `NEXT_PUBLIC_APP_NAME` | Web | Optional | No | Product label | Visual smoke |
| `NEXT_PUBLIC_DEFAULT_TENANT_ID` | Web | Architecture-dependent | No | Public tenant fallback | Confirm it cannot grant access |
| `SENTRY_DSN` | API/Next server | Optional | Treat as restricted configuration | Server-side event ingestion DSN | Controlled staging event |
| `SENTRY_ENVIRONMENT` | API/Next server | Optional | No | Deployment environment tag | Matches deployment tier |
| `SENTRY_RELEASE` | API/Next server | Recommended | No | Immutable release SHA | Matches deployed commit |
| `SENTRY_TRACES_SAMPLE_RATE` | API/Next server | Optional | No | Trace sampling, default `0` | Increase only after privacy/cost review |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser | Optional | No | Browser-visible Sentry DSN | Restricted to the browser project |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Browser | Optional | No | Browser environment tag | Matches deployment tier |
| `NEXT_PUBLIC_SENTRY_RELEASE` | Browser | Recommended | No | Browser release SHA | Matches deployed assets |
| `SENTRY_AUTH_TOKEN` | CI/build only | Only for source-map upload | Yes | Sentry artifact upload credential | Store only in CI secret storage |
| `SENTRY_ORG` | CI/build only | With source-map upload | No | Sentry organization slug | Verify upload destination |
| `SENTRY_PROJECT` | CI/build only | With source-map upload | No | Sentry project slug | Verify upload destination |

Never expose `SENTRY_AUTH_TOKEN`, server DSNs, provider keys, database URLs, or authentication secrets through a `NEXT_PUBLIC_` variable.
