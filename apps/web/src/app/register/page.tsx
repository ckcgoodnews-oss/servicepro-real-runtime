import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata = { title: 'Create an account' };
export default function RegisterPage() { return <main className="simple-auth"><section className="auth-card"><BrandMark /><p className="eyebrow"><span /> ServicePro workspace</p><h1>Create your account</h1><p className="muted">Registration is available when enabled by your organization.</p><RegisterForm /><p className="auth-help">Already have access? <Link href="/login">Sign in</Link></p></section></main>; }
