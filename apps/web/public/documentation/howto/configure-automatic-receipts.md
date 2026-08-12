# HOW TO — Configure Automatic Receipts

Open **Settings → Billing → Customer Payments**, select **Send automatic receipts after verified payment**, and save.

Receipts are attempted only after a signed Stripe webhook reconciles the payment. Delivery uses the configured Resend provider and records `sent`, `failed`, or `skipped`. Email failure does not reverse the payment. Confirm `RESEND_API_KEY` and `EMAIL_FROM` are configured when receipt status is failed.
