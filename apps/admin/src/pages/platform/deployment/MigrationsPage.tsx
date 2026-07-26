// Platform Administration > Deployment & Updates > Migrations
// Database migration history and status.

export type Migration = {
  file: string;
  version: string;
  name: string;
  applied?: boolean;
  appliedAt?: string;
};

export type MigrationsPageProps = {
  migrations: Migration[];
  total: number;
  applied: number;
  pending: number;
};

export function MigrationsPage(props: MigrationsPageProps) {
  return {
    component: 'MigrationsPage',
    migrations: props.migrations,
    stats: { total: props.total, applied: props.applied, pending: props.pending },
    columns: [
      { key: 'version', label: '#', sortable: true },
      { key: 'name', label: 'Migration', sortable: true },
      { key: 'applied', label: 'Status', type: 'boolean-indicator' },
      { key: 'appliedAt', label: 'Applied At', format: 'datetime' }
    ],
    dataEndpoint: 'GET /api/v1/platform/tmc/deployment/migrations'
  };
}
