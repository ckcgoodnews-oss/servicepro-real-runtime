import { AssetWorkspace } from '@/components/AssetWorkspace';

export const metadata = { title: 'Asset management' };

export default function AssetsPage() {
  return <div className="dashboard-content assets-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Installed equipment</p><h1>Asset management</h1><p>Find equipment, understand its condition, and keep every service record and document close.</p></div></div><AssetWorkspace /></div>;
}
