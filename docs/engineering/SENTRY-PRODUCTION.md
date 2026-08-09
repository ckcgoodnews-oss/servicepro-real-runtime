# Sentry Production

No current Sentry runtime integration was found, so this gate is **BLOCKED / OPERATOR ACTION REQUIRED**.

Before claiming completion, integrate request-level API and frontend error capture with environment and release SHA, redact authorization/cookies/tokens/payment data and unnecessary PII, upload source maps securely where applicable, configure alert ownership, and capture one controlled staging then production test event. DSNs/configuration must follow Sentry’s sensitivity guidance; auth tokens are always secret and provider-side only.
