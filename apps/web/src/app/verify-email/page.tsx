import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

export const metadata = { title: 'Verify your email — ServicePro' };

export default function VerifyEmailPage() {
  return (
    <main className="simple-auth">
      <section className="auth-card">
        <BrandMark />
        <h1>Check your email</h1>
        <p className="muted">
          We sent a verification link to your email address. Click the link to activate your trial workspace.
        </p>
        <div className="verify-info">
          <p>The link expires in 24 hours.</p>
          <p>Didn&apos;t receive it? Check spam, or <Link href="/start-free">try again</Link>.</p>
        </div>
        <p className="auth-help"><Link href="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
