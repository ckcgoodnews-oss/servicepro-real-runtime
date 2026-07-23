import { OrganizationWorkspace } from '@/components/OrganizationWorkspace';

export const metadata = { title: 'Organization management' };

export default function OrganizationPage() {
  return <div className="dashboard-content organization-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Workspace administration</p><h1>Organization management</h1><p>Shape the operating structure behind routing, reporting, permissions, and ownership.</p></div></div><OrganizationWorkspace /></div>;
}
