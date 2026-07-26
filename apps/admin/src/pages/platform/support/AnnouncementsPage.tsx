// Platform Administration > Support > Announcements
// System-wide announcements to tenants.

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'active' | 'enterprise' | 'trial';
  priority: 'info' | 'warning' | 'critical';
  publishedAt: string;
  createdBy: string;
};

export type AnnouncementsPageProps = {
  announcements: Announcement[];
};

export function AnnouncementsPage(props: AnnouncementsPageProps) {
  return {
    component: 'AnnouncementsPage',
    announcements: props.announcements,
    columns: [
      { key: 'title', label: 'Title', sortable: true },
      { key: 'audience', label: 'Audience', type: 'badge' },
      { key: 'priority', label: 'Priority', type: 'priority-badge' },
      { key: 'publishedAt', label: 'Published', sortable: true, format: 'datetime' }
    ],
    createForm: {
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'rich-text', required: true },
        { key: 'audience', label: 'Audience', type: 'select', options: ['all', 'active', 'enterprise', 'trial'] },
        { key: 'priority', label: 'Priority', type: 'select', options: ['info', 'warning', 'critical'] }
      ],
      endpoint: 'POST /api/v1/platform/tmc/support/announcements'
    },
    dataEndpoint: 'GET /api/v1/platform/tmc/support/announcements'
  };
}
