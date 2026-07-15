import { DocumentationWorkspace } from '@/components/DocumentationWorkspace';

export const metadata = { title: 'Documentation' };

export default function DocumentationPage() {
  return <div className="dashboard-content docs-page">
    <div className="dashboard-intro"><div><p className="eyebrow"><span /> Product guidance</p><h1>Documentation</h1><p>Learn ServicePro workflows, follow guided tutorials, explore the API, and review each release.</p></div></div>
    <DocumentationWorkspace />
  </div>;
}
