import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { IdentityForm } from '@/components/IdentityForm';
export const metadata = { title: 'Accept your invitation' };
export default function InvitePage() {
  return <main className="simple-auth"><section className="auth-card"><BrandMark /><p className="eyebrow"><span /> Team invitation</p><h1>Join your ServicePro workspace</h1><p className="muted">Finish setting up your profile and choose a secure password.</p><IdentityForm mode="invite" /><p className="auth-help">Already joined? <Link href="/login">Sign in</Link></p></section></main>;
}
