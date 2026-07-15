# Sprint 717 Required Wiring

## Web identity integration

- Set `NEXT_PUBLIC_API_BASE_URL` to the public ServicePro API origin.
- Set `NEXT_PUBLIC_DEFAULT_TENANT_ID` when the deployment does not use `tenant_demo`.
- Add the exact web origins to API `CORS_ALLOWED_ORIGINS`.
- The browser uses `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and `GET /api/v1/me`.
- Non-remembered sessions use `sessionStorage`; remembered sessions use `localStorage`.
- Dashboard routes are client-guarded in both standalone and static-export deployments.

## Recovery, invitations, and MFA

The API now implements:

- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `POST /auth/invitations/accept`
- `POST /auth/mfa/verify`
- rotating refresh tokens and session revocation

Configure a secure email/SMS provider before production enablement. Development tokens are returned only when `NODE_ENV` is not `production` and `EXPOSE_AUTH_TOKENS=true`.

Set `ALLOW_PUBLIC_REGISTRATION=true` only for tenants that intentionally permit self-registration. It is disabled by default.
