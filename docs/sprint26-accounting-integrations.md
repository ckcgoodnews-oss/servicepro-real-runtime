# Sprint 26 - Accounting Integrations

This sprint establishes accounting-provider integration foundations.

Included:
- Provider connection registry
- OAuth token storage model
- QuickBooks Online module boundary
- Xero module boundary
- GL account mapping
- Tax code mapping
- Bank reconciliation model
- Payroll export batches
- Financial reporting API structures

Production follow-up:
- Implement QuickBooks OAuth authorization flow.
- Implement Xero OAuth authorization flow.
- Encrypt provider refresh tokens.
- Add sync workers for customers, invoices, payments, and items.
- Add double-entry ledger enforcement.
- Add accounting-period close controls.
