import Link from 'next/link';
import { Suspense } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { MfaForm } from '@/components/MfaForm';

export const metadata = { title: 'Verify your sign-in' };
export default function MfaPage() { return <main className="simple-auth"><section className="auth-card"><BrandMark /><p className="eyebrow"><span /> Multi-factor authentication</p><h1>Check your verification code</h1><p className="muted">Enter the six-digit code sent through your organization’s secure delivery channel.</p><Suspense fallback={<p className="session-loading">Preparing verification…</p>}><MfaForm /></Suspense><p className="auth-help"><Link href="/login">Return to sign in</Link></p></section></main>; }
