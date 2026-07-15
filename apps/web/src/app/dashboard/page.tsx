import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoutButton } from '@/components/LogoutButton';
import { DashboardOverview } from '@/components/DashboardOverview';

export const metadata = { title: 'Operations dashboard' };
const nav = ['Overview','Work orders','Schedule','Customers','Assets','Reports'];

export default function DashboardPage() {
  return <main className="app-shell"><aside className="sidebar"><BrandMark /><nav aria-label="Application navigation">{nav.map((item,index)=><Link className={index===0?'active':''} href="/dashboard" key={item}><span>{['⌂','▤','◫','◎','◇','↗'][index]}</span>{item}</Link>)}</nav><div className="sidebar-bottom"><Link href="/dashboard"><span>⚙</span>Settings</Link><LogoutButton /><div className="user-chip"><b>AM</b><span><strong>Signed in</strong><small>ServicePro workspace</small></span></div></div></aside><section className="workspace"><header className="workspace-header"><div><small>Live tenant workspace</small><strong>Operations dashboard</strong></div><div className="workspace-actions"><button className="search-button" type="button">⌕ <span>Search anything</span><kbd>⌘ K</kbd></button><ThemeToggle /><button className="icon-button" type="button" aria-label="Notifications">♢<i /></button><button className="button button-small" type="button">+ New work order</button></div></header><div className="dashboard-content"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Operations overview</p><h1>Everything in motion.</h1><p>Live work, customers, financial exposure, and activity for your tenant.</p></div><button className="date-button" type="button">Today</button></div><DashboardOverview /></div></section></main>;
}
