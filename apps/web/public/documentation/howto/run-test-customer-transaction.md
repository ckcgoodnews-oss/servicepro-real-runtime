# HOW TO — Run a Test Customer Transaction

Use Stripe test mode only.

1. Configure test-mode Stripe and Connect credentials plus both webhook secrets.
2. Connect a test Express account and confirm charges are enabled.
3. Enable customer payments for the test subscriber.
4. Create a distinguishable test customer and invoice.
5. Pay through the portal with a Stripe test card.
6. Confirm the signed Connect webhook changes the local payment and invoice exactly once.
7. Confirm receipt delivery status.
8. Request a small refund and confirm the invoice changes only after `charge.refunded`.

Never use live credentials or live charges for this validation without explicit authorization.
