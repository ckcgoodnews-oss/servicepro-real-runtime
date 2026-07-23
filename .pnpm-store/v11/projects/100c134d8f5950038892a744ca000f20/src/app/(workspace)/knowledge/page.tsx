import { KnowledgeWorkspace } from '@/components/KnowledgeWorkspace';
export const metadata = { title: 'Knowledge center' };
export default function KnowledgePage() { return <div className="dashboard-content knowledge-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Field intelligence</p><h1>Knowledge center</h1><p>Search service guidance, equipment manuals, AI summaries, and supporting documents.</p></div></div><KnowledgeWorkspace /></div>; }
