const PROVISIONING_STEPS = [
  'validate_request',
  'create_tenant',
  'create_owner_user',
  'assign_license',
  'apply_feature_flags',
  'create_branding_profile',
  'configure_default_settings',
  'send_welcome_email',
  'complete'
];

module.exports = { PROVISIONING_STEPS };
