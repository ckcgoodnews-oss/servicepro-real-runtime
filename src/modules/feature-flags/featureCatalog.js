const FEATURE_CATALOG = [
  { key: 'customer_portal', name: 'Customer Portal', category: 'portal', defaultEnabled: true },
  { key: 'mobile_app', name: 'Mobile App', category: 'field', defaultEnabled: true },
  { key: 'inventory', name: 'Inventory', category: 'operations', defaultEnabled: false },
  { key: 'api_access', name: 'API Access', category: 'integrations', defaultEnabled: false },
  { key: 'ai_assistant', name: 'AI Assistant', category: 'ai', defaultEnabled: false },
  { key: 'multi_location', name: 'Multi-Location', category: 'enterprise', defaultEnabled: false }
];

module.exports = { FEATURE_CATALOG };
