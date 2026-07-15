# Sprint 717 Required Wiring

## Web identity integration

- Set `NEXT_PUBLIC_API_BASE_URL` to the public ServicePro API origin.
- Set `NEXT_PUBLIC_DEFAULT_TENANT_ID` when the deployment does not use `tenant_demo`.
- Add the exact web origins to API `CORS_ALLOWED_ORIGINS`.
- The browser uses the existing `POST /auth/login` and `GET /api/v1/me` API contracts.
- Non-remembered sessions use `sessionStorage`; remembered sessions use `localStorage`.
- Dashboard routes are client-guarded in both standalone and static-export deployments.

## Backend prerequisites for recovery and invitations

The imported SBP and service-site-saas ideas are represented by web routes, but production enablement requires the API implementation and delivery provider for:

- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `POST /auth/invitations/accept`
- invitation creation and secure email delivery
- MFA enrollment, challenge verification, recovery codes, and session revocation

Do not advertise password recovery, invitations, or MFA as production-ready until those API contracts and delivery controls are complete.
