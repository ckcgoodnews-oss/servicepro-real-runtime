import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { IdentityForm } from '@/components/IdentityForm';
export const metadata = { title: 'Recover your account' };
export default function ForgotPasswordPage() {
  return <main className="simple-auth"><section className="auth-card"><BrandMark /><p className="eyebrow"><span /> Account recovery</p><h1>Reset your password</h1><p className="muted">Enter your work email and we will send secure reset instructions.</p><IdentityForm mode="forgot" /><p className="auth-help"><Link href="/login">Back to sign in</Link></p></section></main>;
}
