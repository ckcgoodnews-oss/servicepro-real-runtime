# Sentry Production

ServicePRO uses `@sentry/node` for the custom Node API and `@sentry/nextjs` for Next.js server, edge, and browser errors. Sentry is optional: missing DSNs do not affect `/healthz`, `/readyz`, startup, or application traffic.

## Runtime configuration

- API and Next server: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, and optional `SENTRY_TRACES_SAMPLE_RATE`.
- Browser: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_RELEASE`, and optional `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`.
- A DSN is an ingestion identifier, not an administrative credential, but server configuration should still remain server-side. Only the browser project DSN may use the `NEXT_PUBLIC_` prefix.

Default trace sampling is zero. Session Replay is not enabled. `sendDefaultPii` is disabled. Both runtimes redact authorization, cookies, passwords, tokens, API keys, client secrets, database connection strings, and JWT/Bearer values before transmission. Application code does not attach request bodies to error events.

## Source maps

Source-map upload is enabled only when all of `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` exist during the web build. Store the auth token only in protected CI/build secret storage. It must never use a `NEXT_PUBLIC_` name or enter runtime environment examples. Uploaded browser maps are deleted from build output after upload; ordinary builds do not enable public production browser source maps.

## Release procedure

1. Create separate server and browser projects in Sentry and configure their DSNs.
2. Set release values to the deployed immutable Git SHA.
3. Build staging with protected source-map credentials if source maps are required.
4. Trigger one controlled API error and one controlled browser error without customer data.
5. Verify environment/release tags and confirm sensitive headers and fields are absent.
6. Configure error-rate and new-regression alerts with maintained owners.

No real Sentry credentials are stored in this repository.
