// Platform Administration > Platform Configuration > Global Settings
// Platform-wide configuration: signup, security, defaults.

export type GlobalConfig = {
  platformName: string;
  defaultLocale: string;
  defaultTimezone: string;
  signupEnabled: boolean;
  trialDays: number;
  maxTenantsPerOwner: number;
  maintenanceMode: boolean;
  publicRegistration: boolean;
  requireEmailVerification: boolean;
  passwordMinLength: number;
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
};

export type GlobalSettingsPageProps = {
  config: GlobalConfig;
};

export function GlobalSettingsPage(props: GlobalSettingsPageProps) {
  return {
    component: 'GlobalSettingsPage',
    config: props.config,
    sections: [
      {
        key: 'general',
        label: 'General',
        fields: [
          { key: 'platformName', label: 'Platform Name', type: 'text' },
          { key: 'defaultLocale', label: 'Default Locale', type: 'select', options: ['en-US', 'en-GB', 'es', 'fr', 'de'] },
          { key: 'defaultTimezone', label: 'Default Timezone', type: 'timezone-select' },
          { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle', destructive: true }
        ]
      },
      {
        key: 'registration',
        label: 'Registration & Onboarding',
        fields: [
          { key: 'signupEnabled', label: 'Signup Enabled', type: 'toggle' },
          { key: 'publicRegistration', label: 'Public Registration', type: 'toggle' },
          { key: 'trialDays', label: 'Trial Duration (days)', type: 'number' },
          { key: 'maxTenantsPerOwner', label: 'Max Tenants per Owner', type: 'number' },
          { key: 'requireEmailVerification', label: 'Require Email Verification', type: 'toggle' }
        ]
      },
      {
        key: 'security',
        label: 'Security Policies',
        fields: [
          { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number' },
          { key: 'mfaRequired', label: 'Require MFA', type: 'toggle' },
          { key: 'sessionTimeoutMinutes', label: 'Session Timeout (minutes)', type: 'number' }
        ]
      }
    ],
    endpoint: 'PATCH /api/v1/platform/tmc/config/global',
    dataEndpoint: 'GET /api/v1/platform/tmc/config/global'
  };
}
