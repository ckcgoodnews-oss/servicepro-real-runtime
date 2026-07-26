// Platform Administration > Deployment & Updates > Configuration
// Runtime configuration overview and environment health.

export type DeploymentConfig = {
  currentVersion: string;
  environment: string;
  dataStore: string;
  port: number;
  jwtConfigured: boolean;
  platformAdminsConfigured: boolean;
};

export type ConfigurationPageProps = {
  config: DeploymentConfig;
};

export function ConfigurationPage(props: ConfigurationPageProps) {
  return {
    component: 'DeploymentConfigurationPage',
    config: props.config,
    sections: [
      { key: 'runtime', label: 'Runtime', fields: ['currentVersion', 'environment', 'dataStore', 'port'] },
      { key: 'security', label: 'Security Status', fields: ['jwtConfigured', 'platformAdminsConfigured'] }
    ],
    dataEndpoint: 'GET /api/v1/platform/tmc/deployment/config'
  };
}
