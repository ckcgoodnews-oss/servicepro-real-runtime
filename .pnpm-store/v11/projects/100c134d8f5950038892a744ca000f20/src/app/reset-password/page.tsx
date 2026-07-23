import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { IdentityForm } from '@/components/IdentityForm';
export const metadata = { title: 'Choose a new password' };
export default function ResetPasswordPage() {
  return <main className="simple-auth"><section className="auth-card"><BrandMark /><p className="eyebrow"><span /> Secure recovery</p><h1>Choose a new password</h1><p className="muted">Use at least 12 characters and avoid passwords used elsewhere.</p><IdentityForm mode="reset" /><p className="auth-help"><Link href="/login">Back to sign in</Link></p></section></main>;
}
