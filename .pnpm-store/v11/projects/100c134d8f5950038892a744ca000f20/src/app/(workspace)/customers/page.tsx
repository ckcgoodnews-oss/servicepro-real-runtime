import { CustomerWorkspace } from '@/components/CustomerWorkspace';

export const metadata={title:'Customers'};
export default function CustomersPage(){return <div className="dashboard-content customers-page"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Customer relationships</p><h1>Customers</h1><p>Manage contacts, service activity, and customer assets across residential and commercial accounts.</p></div></div><CustomerWorkspace/></div>;}
