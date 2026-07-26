// Platform Administration > Platform Configuration > Global Feature Gates
// Platform-wide feature gates that control module availability.

export type FeatureGate = {
  key: string;
  label: string;
  enabled: boolean;
  stage: 'planned' | 'alpha' | 'beta' | 'ga' | 'deprecated';
};

export type FeatureGatesPageProps = {
  gates: Record<string, FeatureGate>;
};

export function FeatureGatesPage(props: FeatureGatesPageProps) {
  return {
    component: 'FeatureGatesPage',
    gates: props.gates,
    columns: [
      { key: 'label', label: 'Feature', sortable: true },
      { key: 'stage', label: 'Stage', type: 'stage-badge' },
      { key: 'enabled', label: 'Enabled', type: 'toggle' }
    ],
    stageOptions: ['planned', 'alpha', 'beta', 'ga', 'deprecated'],
    stageColors: { planned: 'gray', alpha: 'purple', beta: 'blue', ga: 'green', deprecated: 'red' },
    endpoint: 'PATCH /api/v1/platform/tmc/config/feature-gates',
    dataEndpoint: 'GET /api/v1/platform/tmc/config/feature-gates'
  };
}
