# Refund a Customer Payment

Refunds require the **Refund payments** permission.

The production API supports tenant-scoped full and partial refunds against the same connected Stripe account that received the payment. The dedicated refund button is not yet available in the web interface. Until it is added, authorized operators should use the documented administrative API workflow or the subscriber's Stripe Express Dashboard and reconcile the result through Stripe webhooks.

Never refund a customer payment from Aardvark's ServicePRO subscription Stripe account.
