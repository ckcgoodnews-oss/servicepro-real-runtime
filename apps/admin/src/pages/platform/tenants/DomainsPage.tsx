// Platform Administration > Tenant Management > Domains
// Custom domain management: add, validate DNS, track SSL status.

export type DomainRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  domain: string;
  status: 'pending_dns' | 'dns_verified' | 'active' | 'failed';
  sslStatus: 'pending' | 'provisioning' | 'active' | 'expired' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type DomainsPageProps = {
  domains: DomainRecord[];
};

export function DomainsPage(props: DomainsPageProps) {
  return {
    component: 'DomainsPage',
    domains: props.domains,
    columns: [
      { key: 'domain', label: 'Domain', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'status', label: 'DNS Status', type: 'status-badge' },
      { key: 'sslStatus', label: 'SSL', type: 'status-badge' },
      { key: 'createdAt', label: 'Added', sortable: true }
    ],
    addForm: {
      fields: [
        { key: 'tenantId', label: 'Tenant', type: 'tenant-select', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'app.company.com' }
      ],
      endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/domains'
    },
    statusFlow: ['pending_dns', 'dns_verified', 'active'],
    sslFlow: ['pending', 'provisioning', 'active']
  };
}
