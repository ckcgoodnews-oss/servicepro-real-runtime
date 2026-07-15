import { DashboardOverview } from '@/components/DashboardOverview';

export const metadata = { title: 'Operations dashboard' };

export default function DashboardPage() {
  return <div className="dashboard-content"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Operations overview</p><h1>Everything in motion.</h1><p>Live work, customers, financial exposure, and activity for your tenant.</p></div><button className="date-button" type="button">Today</button></div><DashboardOverview /></div>;
}
