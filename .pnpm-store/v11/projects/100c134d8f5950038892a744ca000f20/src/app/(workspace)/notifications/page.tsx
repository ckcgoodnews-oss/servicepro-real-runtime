import { NotificationsWorkspace } from '@/components/NotificationsWorkspace';
export const metadata = { title: 'Notification center' };
export default function NotificationsPage(){return <div className="dashboard-content notifications-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Stay informed</p><h1>Notification center</h1><p>Review operational updates and choose how ServicePro reaches you.</p></div></div><NotificationsWorkspace/></div>;}
