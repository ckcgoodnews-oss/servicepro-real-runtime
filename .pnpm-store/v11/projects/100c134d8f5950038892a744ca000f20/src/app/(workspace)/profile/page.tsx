import { ProfileWorkspace } from '@/components/ProfileWorkspace';

export const metadata = { title: 'Profile and preferences' };

export default function ProfilePage() {
  return <div className="dashboard-content profile-page"><div className="dashboard-intro"><div><p className="eyebrow"><span /> Personal workspace</p><h1>Profile and preferences</h1><p>Manage your identity, security, notifications, and developer access.</p></div></div><ProfileWorkspace /></div>;
}
