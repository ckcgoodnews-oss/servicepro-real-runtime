import Link from 'next/link';
import { Suspense } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { TrialRegisterForm } from '@/components/TrialRegisterForm';

export const metadata = { title: 'Start your free trial — ServicePro' };

export default function StartFreePage() {
  return (
    <main className="simple-auth trial-register-page">
      <section className="auth-card trial-card">
        <BrandMark />
        <h1>Start your free 14-day trial</h1>
        <p className="muted">No credit card required. Full access to ServicePro Professional.</p>
        <Suspense fallback={null}>
          <TrialRegisterForm />
        </Suspense>
        <p className="auth-help">Already have an account? <Link href="/login">Sign in</Link></p>
        <ul className="trial-benefits">
          <li>✓ Unlimited service management</li>
          <li>✓ Dispatch &amp; scheduling</li>
          <li>✓ Customer portal</li>
          <li>✓ Invoicing &amp; estimates</li>
          <li>✓ Storefront builder</li>
          <li>✓ AI assistant</li>
        </ul>
      </section>
    </main>
  );
}
