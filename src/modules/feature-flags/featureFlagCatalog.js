const FEATURE_FLAGS = [
  { key: 'customer_portal', name: 'Customer Portal', defaultEnabled: true },
  { key: 'online_payments', name: 'Online Payments', defaultEnabled: false },
  { key: 'inventory', name: 'Inventory', defaultEnabled: false },
  { key: 'ai_dispatch', name: 'AI Dispatch', defaultEnabled: false },
  { key: 'multi_location', name: 'Multi-Location', defaultEnabled: false },
  { key: 'api_access', name: 'API Access', defaultEnabled: false }
];

module.exports = { FEATURE_FLAGS };
