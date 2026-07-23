import { SystemStatusWorkspace } from '@/components/SystemStatusWorkspace';

export const metadata={title:'System status'};
export default function SystemStatusPage(){return <div className="dashboard-content"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Online application</p><h1>System status</h1><p>Verify website connectivity, API health, runtime readiness, and your authenticated workspace.</p></div></div><SystemStatusWorkspace/></div>;}
