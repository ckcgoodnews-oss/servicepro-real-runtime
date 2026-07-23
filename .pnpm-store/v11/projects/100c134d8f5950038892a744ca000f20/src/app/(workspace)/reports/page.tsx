import { ReportsWorkspace } from '@/components/ReportsWorkspace';
export const metadata={title:'Reporting'};
export default function ReportsPage(){return <div className="dashboard-content reports-page"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Business intelligence</p><h1>Reporting</h1><p>Track revenue, workload, inventory, exports, and scheduled delivery from live service data.</p></div></div><ReportsWorkspace/></div>;}
