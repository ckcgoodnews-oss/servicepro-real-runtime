'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

export function LoginForm() {
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/dashboard');
  }
  return <form onSubmit={submit}><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@company.com" required /></label><label>Password<span className="label-row"><Link href="/login">Forgot password?</Link></span><input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" required /></label><label className="check-row"><input type="checkbox" name="remember" /> Keep me signed in on this device</label><button className="button button-wide" type="submit">Sign in <span aria-hidden="true">→</span></button></form>;
}
