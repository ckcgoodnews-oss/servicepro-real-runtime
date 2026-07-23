import { WorkOrderWorkspace } from '@/components/WorkOrderWorkspace';

export const metadata={title:'Schedule'};
export default function SchedulePage(){return <div className="dashboard-content work-orders-page"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Service calendar</p><h1>Schedule</h1><p>Coordinate appointments, technician assignments, and service windows across every trade.</p></div></div><WorkOrderWorkspace initialView="calendar"/></div>;}
