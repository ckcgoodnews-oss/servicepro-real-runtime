import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { LoginForm } from '@/components/LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-story"><BrandMark /><div><p className="eyebrow light"><span /> Welcome back</p><h1>Your operation is already moving.</h1><p>Sign in to see today’s work, your team, and what needs attention next.</p></div><blockquote>“We stopped managing from five different screens. Now everyone starts the day in ServicePro.”<cite>Operations Director · Commercial Services</cite></blockquote></section><section className="auth-panel"><div className="auth-card"><p className="mobile-brand"><BrandMark /></p><p className="eyebrow"><span /> Secure workspace</p><h2>Sign in to ServicePro</h2><p className="muted">Use your organization credentials to continue.</p><LoginForm /><p className="auth-help">Need access? <Link href="/register">Create an account</Link> or <Link href="mailto:support@aardvark-enterprises.net">contact your administrator</Link></p><p className="security-note">Protected by encrypted transport and enterprise access controls.</p></div></section></main>;
}
