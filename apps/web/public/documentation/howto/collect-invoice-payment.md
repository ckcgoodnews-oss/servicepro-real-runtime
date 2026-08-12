# Collect an Invoice Payment

## Customer portal

1. The customer signs in to the customer portal.
2. They open **Invoices & Payments**.
3. They select **Pay now** beside an outstanding invoice.
4. Stripe securely displays the available payment methods.
5. They select **Pay securely** and complete any bank authentication challenge.
6. ServicePRO shows the payment as submitted. The invoice changes only after Stripe sends a signed success webhook and ServicePRO reconciles the connected account, amount, and currency.

The customer cannot pay more than the server-recorded invoice balance. Partial payments are accepted only when enabled by the subscriber.
