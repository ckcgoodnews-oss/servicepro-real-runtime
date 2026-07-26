// Platform Administration > Support > Tickets
// Support ticket management for tenant issues.

export type SupportTicket = {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
};

export type TicketsPageProps = {
  tickets: SupportTicket[];
};

export function TicketsPage(props: TicketsPageProps) {
  return {
    component: 'SupportTicketsPage',
    tickets: props.tickets,
    columns: [
      { key: 'subject', label: 'Subject', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'status', label: 'Status', type: 'status-badge', sortable: true },
      { key: 'priority', label: 'Priority', type: 'priority-badge', sortable: true },
      { key: 'assignedTo', label: 'Assigned To' },
      { key: 'updatedAt', label: 'Updated', sortable: true, format: 'relative-time' }
    ],
    statusOptions: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
    priorityOptions: ['low', 'medium', 'high', 'critical'],
    dataEndpoint: 'GET /api/v1/platform/tmc/support/tickets'
  };
}
