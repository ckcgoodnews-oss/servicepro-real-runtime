import {ExpressServiceSettings} from '@/components/ExpressServiceSettings';
import {ExpressServiceRequests} from '@/components/ExpressServiceRequests';
export const metadata={title:'Express Service settings'};export default function Page(){return <div className="dashboard-content settings-page"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Customer Experience</p><h1>Express Service</h1><p>Configure eligible services, areas, and request behavior; then process customer requests.</p></div></div><ExpressServiceSettings/><ExpressServiceRequests/></div>}
