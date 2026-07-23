import { WorkOrderWorkspace } from '@/components/WorkOrderWorkspace';

export const metadata = { title: 'Work orders' };

export default function WorkOrdersPage() {
  return <div className="dashboard-content work-orders-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Service delivery</p><h1>Work orders</h1><p>Plan, assign, and move every job from intake through completion.</p></div></div><WorkOrderWorkspace /></div>;
}
