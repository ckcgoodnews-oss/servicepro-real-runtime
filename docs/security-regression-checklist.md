# Security Regression Checklist

- Session cookies are HTTP-only.
- Secure cookies are enabled in production.
- CSRF protection is enabled on browser forms.
- API routes require scoped credentials.
- Tenant IDs are enforced on all tenant data reads.
- Password hashes are never logged.
- Secrets are not committed to the repository.
- Upload MIME types and sizes are restricted.
- Audit events are generated for sensitive actions.
