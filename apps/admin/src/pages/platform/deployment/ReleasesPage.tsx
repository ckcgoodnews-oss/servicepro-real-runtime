// Platform Administration > Deployment & Updates > Releases
// Release history, current version, deployment status.

export type Release = {
  id: string;
  version: string;
  status: 'deployed' | 'rollback_pending' | 'rolled_back' | 'failed';
  deployedAt: string;
  notes: string;
};

export type ReleasesPageProps = {
  releases: Release[];
  currentVersion: string;
};

export function ReleasesPage(props: ReleasesPageProps) {
  return {
    component: 'ReleasesPage',
    releases: props.releases,
    currentVersion: props.currentVersion,
    columns: [
      { key: 'version', label: 'Version', sortable: true },
      { key: 'status', label: 'Status', type: 'status-badge' },
      { key: 'deployedAt', label: 'Deployed', sortable: true, format: 'datetime' },
      { key: 'notes', label: 'Notes' }
    ],
    rollbackForm: {
      fields: [
        { key: 'targetVersion', label: 'Target Version', type: 'select', required: true },
        { key: 'reason', label: 'Reason', type: 'textarea', required: true }
      ],
      endpoint: 'POST /api/v1/platform/tmc/deployment/rollback',
      confirm: true,
      confirmMessage: 'This will initiate a rollback. Are you sure?'
    },
    dataEndpoint: 'GET /api/v1/platform/tmc/deployment/releases'
  };
}
