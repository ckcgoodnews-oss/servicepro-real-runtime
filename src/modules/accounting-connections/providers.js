const ACCOUNTING_PROVIDERS = {
  QUICKBOOKS_ONLINE: 'quickbooks_online',
  XERO: 'xero',
  CSV_EXPORT: 'csv_export',
  MANUAL: 'manual'
};

const CONNECTION_STATUSES = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  EXPIRED: 'expired',
  ERROR: 'error'
};

module.exports = { ACCOUNTING_PROVIDERS, CONNECTION_STATUSES };
