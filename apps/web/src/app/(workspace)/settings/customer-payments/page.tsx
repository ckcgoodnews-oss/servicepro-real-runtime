import {CustomerPaymentsSettings} from '@/components/CustomerPaymentsSettings';
export const metadata={title:'Customer Payments'};
export default function CustomerPaymentsPage(){return <div className="dashboard-content settings-page"><div className="dashboard-intro"><div><p className="eyebrow"><span/> Billing settings</p><h1>Customer Payments</h1><p>Connect Stripe and control how customers pay your invoices.</p></div></div><CustomerPaymentsSettings/></div>}
