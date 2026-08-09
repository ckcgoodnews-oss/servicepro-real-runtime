# Transactional Email Production Gate

**EMAIL NOT PRODUCTION READY.** The current service calls SendGrid and returns simulated success when unconfigured. Resend is not implemented, and required security/customer message delivery is not proven.

Choose one provider and preserve a provider-neutral service boundary. In production, missing configuration and non-2xx provider responses must fail observably; simulation is development/test behavior only.

Before enabling email, verify the sender domain, a single valid SPF policy, DKIM, DMARC, restricted provider key storage, `EMAIL_FROM=ServicePro <noreply@aardvark-enterprises.net>`, received verification/password-reset messages, provider failure handling, and absence of keys from frontend assets.
