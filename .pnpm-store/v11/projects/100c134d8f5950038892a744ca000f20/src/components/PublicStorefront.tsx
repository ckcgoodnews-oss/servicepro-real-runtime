'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiUrl } from '@/auth/session';

export function PublicStorefront() {
  const [data, setData] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [serviceId, setServiceId] = useState('');

  useEffect(() => {
    const value = (new URLSearchParams(location.search).get('business') || '').trim().toLowerCase();
    setServiceId(new URLSearchParams(location.search).get('service') || '');
    setSlug(value);
    if (!value) {
      setError('Business page not specified.');
      return;
    }
    fetch(apiUrl(`/api/public/storefront/${encodeURIComponent(value)}`))
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw Error(body.error?.message || 'Storefront unavailable');
        setData(body.data);
      })
      .catch((problem) => setError(problem.message));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(apiUrl(`/api/public/storefront/${encodeURIComponent(slug)}`), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error?.message || 'Unable to send request');
      return;
    }
    setSent(true);
    event.currentTarget.reset();
  }

  if (error) {
    return (
      <main className="public-storefront-error">
        <h1>Service page unavailable</h1>
        <p>{error}</p>
        <a href="/login/">Open ServicePro</a>
      </main>
    );
  }
  if (!data) return <main className="public-storefront-loading">Loading business...</main>;

  const style = {
    '--store-primary': data.theme.config.primary,
    '--store-secondary': data.theme.config.secondary,
  } as React.CSSProperties;
  const selectedService = data.services.find((service: any) => service.id === serviceId);

  return (
    <main className={`public-storefront theme-${data.theme.slug}`} style={style}>
      <header>
        <strong>{data.logoUrl ? <img src={data.logoUrl} alt="" /> : data.companyName}</strong>
        <nav aria-label="Business website navigation">
          <a href={`/p/?business=${encodeURIComponent(slug)}`}>Home</a>
          {data.services.map((service: any) => (
            <a
              className={service.id === serviceId ? 'active' : ''}
              href={`/p/?business=${encodeURIComponent(slug)}&service=${encodeURIComponent(service.id)}`}
              key={service.id}
            >
              {service.name}
            </a>
          ))}
          <a href="#request">Request service</a>
        </nav>
        {data.contactPhone && <a className="storefront-call" href={`tel:${data.contactPhone}`}>{data.contactPhone}</a>}
      </header>
      <section
        className="storefront-hero"
        style={{ backgroundImage: `linear-gradient(90deg,rgba(8,25,23,.9),rgba(8,25,23,.12)),url(${data.heroImageUrl})` }}
      >
        <div>
          <span>Local service professionals</span>
          <h1>{data.tagline || `Service you can count on from ${data.companyName}.`}</h1>
          <p>{data.description}</p>
          <a href="#request">Request service</a>
        </div>
      </section>
      {selectedService && (
        <section className="storefront-service-page">
          <a href={`/p/?business=${encodeURIComponent(slug)}#services`}>← All services</a>
          <div>
            <div>
              <span>Professional service</span>
              <h1>{selectedService.pageHeadline}</h1>
              <p>{selectedService.pageBody}</p>
              {!!selectedService.benefits.length && (
                <ul>{selectedService.benefits.map((benefit: string) => <li key={benefit}>{benefit}</li>)}</ul>
              )}
              {selectedService.startingPrice && <strong>Starting at ${Number(selectedService.startingPrice).toFixed(0)}</strong>}
              <a href="#request">Request {selectedService.name}</a>
            </div>
            {selectedService.imageUrl && <img src={selectedService.imageUrl} alt={selectedService.name} />}
          </div>
        </section>
      )}
      {!selectedService && <section className="storefront-services" id="services">
        <span>What we do</span>
        <h2>Professional services for your property</h2>
        <div>
          {data.services.map((service: any) => (
            <article key={service.id}>
              {service.imageUrl && <img src={service.imageUrl} alt={service.name} />}
              <div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                {service.startingPrice && <strong>Starting at ${Number(service.startingPrice).toFixed(0)}</strong>}
                <a className="storefront-service-link" href={`/p/?business=${encodeURIComponent(slug)}&service=${encodeURIComponent(service.id)}`}>View service details →</a>
              </div>
            </article>
          ))}
        </div>
      </section>}
      <section className="storefront-request" id="request">
        <div>
          <span>Let&apos;s get started</span>
          <h2>Request service or more information</h2>
          <p>{data.serviceArea && `Serving ${data.serviceArea}. `}{data.hours}</p>
        </div>
        {sent ? (
          <div className="storefront-success">
            <h3>Thank you.</h3>
            <p>Your request has been sent to {data.companyName}.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <input name="name" placeholder="Your name" required />
            <div><input name="email" type="email" placeholder="Email" /><input name="phone" placeholder="Phone" /></div>
            <select name="serviceId" defaultValue={selectedService?.id || ''}>
              <option value="">Select a service</option>
              {data.services.map((service: any) => <option value={service.id} key={service.id}>{service.name}</option>)}
            </select>
            <textarea name="message" placeholder="How can we help?" rows={5} required />
            <button>Send request</button>
          </form>
        )}
      </section>
      <footer>
        <strong>{data.companyName}</strong>
        <span>{data.contactEmail} · {data.contactPhone}</span>
        <small>Powered by ServicePro</small>
      </footer>
    </main>
  );
}
