'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiUrl, saveSession, type AuthSession } from '@/auth/session';
import { PasswordInput } from '@/components/PasswordInput';

const INDUSTRIES = [
  'Plumbing', 'HVAC', 'Electrical', 'Landscaping', 'Cleaning',
  'Roofing', 'Pest Control', 'Appliance Repair', 'Restoration',
  'Property Maintenance', 'Moving', 'Junk Removal', 'Painting',
  'Flooring', 'Fencing', 'Pool Service', 'Garage Door', 'Locksmith',
  'Handyman', 'Concrete & Masonry', 'Insulation', 'Glass & Mirror',
  'Elevator & Escalator', 'Fire Protection', 'Generator Service',
  'Well & Water Treatment', 'Paving & Sealcoating', 'Demolition',
  'Other'
].sort();

export function TrialRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'info' | 'company'>('info');

  const preselectedIndustry = searchParams.get('industry') || '';
  const source = searchParams.get('source') || '';
  const campaign = searchParams.get('campaign') || '';
  const plan = searchParams.get('plan') || '';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);

    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
      companyName: data.get('companyName'),
      phone: data.get('phone') || '',
      industry: data.get('industry') || '',
      teamSize: data.get('teamSize') || '',
      source,
      campaign,
      plan
    };

    try {
      const response = await fetch(apiUrl('/api/v1/trial/register'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Registration failed');

      // If auto-verified (dev mode), go straight to dashboard
      if (body.data?.accessToken) {
        saveSession({
          accessToken: body.data.accessToken,
          refreshToken: '',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: body.data.user
        } as AuthSession, false);
        router.replace('/dashboard?welcome=trial');
      } else {
        // Redirect to verification pending page
        router.replace('/verify-email?email=' + encodeURIComponent(String(payload.email)));
      }
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="trial-form">
      {step === 'info' && (
        <div className="trial-step">
          <label>
            Full name
            <input name="name" autoComplete="name" required autoFocus />
          </label>
          <label>
            Work email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <PasswordInput name="password" autoComplete="new-password" minLength={12} required />
          </label>
          <p className="password-hint">12+ characters with uppercase, lowercase, number, and symbol.</p>
          <button type="button" className="button button-wide" onClick={() => setStep('company')}>
            Continue
          </button>
        </div>
      )}

      {step === 'company' && (
        <div className="trial-step">
          <label>
            Company name
            <input name="companyName" autoComplete="organization" required autoFocus />
          </label>
          <label>
            Phone (optional)
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Industry
            <select name="industry" defaultValue={preselectedIndustry}>
              <option value="">Select your industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i.toLowerCase().replace(/\s+/g, '-')}>{i}</option>)}
            </select>
          </label>
          <label>
            Team size
            <select name="teamSize">
              <option value="">How many team members?</option>
              <option value="1">Just me</option>
              <option value="2-5">2–5</option>
              <option value="6-15">6–15</option>
              <option value="16-50">16–50</option>
              <option value="50+">50+</option>
            </select>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-wide" disabled={busy} type="submit">
            {busy ? 'Creating your trial...' : 'Start free trial'}
          </button>
          <button type="button" className="text-link" onClick={() => setStep('info')}>
            ← Back
          </button>
        </div>
      )}

      {/* Hidden fields for query params */}
      {step === 'info' && (
        <>
          <input type="hidden" name="companyName" value="" />
          <input type="hidden" name="industry" value={preselectedIndustry} />
        </>
      )}
    </form>
  );
}
