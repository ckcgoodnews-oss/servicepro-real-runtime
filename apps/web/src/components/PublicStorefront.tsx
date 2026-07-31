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
    '--site-blue': data.theme.config.primary,
    '--site-sky': data.theme.config.accent || data.theme.config.secondary,
    '--site-navy': data.theme.config.dark || '#071f38',
  } as React.CSSProperties;
  const selectedService = data.services.find((service: any) => service.id === serviceId);

  return (
    <main className={`public-storefront theme-${data.theme.slug}`} style={style}>
      <div className="storefront-utility">
        <a href="#request">Schedule service online</a>
        <span>
          {data.contactEmail && <a href={`mailto:${data.contactEmail}`}>Email us</a>}
          {data.contactPhone && <a href={`tel:${data.contactPhone}`}>Call {data.contactPhone}</a>}
        </span>
      </div>
      <header className="storefront-site-header">
        <div className="storefront-brand-row">
          <strong>{data.logoUrl ? <img src={data.logoUrl} alt={data.companyName} /> : data.companyName}</strong>
          <div>
            <small>Call now to schedule service</small>
            {data.contactPhone && <a href={`tel:${data.contactPhone}`}>{data.contactPhone}</a>}
            <a href="#request">Or schedule service online</a>
          </div>
        </div>
        <nav className="storefront-main-nav" aria-label="Business website navigation">
          <a href={`/p/?business=${encodeURIComponent(slug)}`}>Home</a>
          <a href="#services">Services</a>
          {data.services.slice(0, 4).map((service: any) => (
            <a
              className={service.id === serviceId ? 'active' : ''}
              href={`/p/?business=${encodeURIComponent(slug)}&service=${encodeURIComponent(service.id)}`}
              key={service.id}
            >
              {service.name}
            </a>
          ))}
          <a href="#request">Contact</a>
        </nav>
      </header>
      <section
        className="storefront-hero"
        style={{ backgroundImage: `linear-gradient(90deg,rgba(5,27,55,.9),rgba(19,56,105,.65)),url(${data.heroImageUrl})` }}
      >
        <div>
          <span>Local professionals · Dependable service</span>
          <h1>{data.tagline || `Need service? Call a pro.`}</h1>
          <p>{data.description || `${data.companyName} delivers responsive, professional service when your home or business needs it.`}</p>
          <div className="storefront-hero-actions">
            <a href="#request">Schedule service</a>
            {data.contactPhone && <a href={`tel:${data.contactPhone}`}>Call {data.contactPhone}</a>}
          </div>
        </div>
      </section>
      <section className="storefront-trust-strip" aria-label="Service commitments">
        <span><strong>Responsive</strong><small>Clear scheduling and communication</small></span>
        <span><strong>Professional</strong><small>Experienced local specialists</small></span>
        <span><strong>Dependable</strong><small>Quality work you can count on</small></span>
        <span><strong>Local</strong><small>{data.serviceArea || 'Proudly serving our community'}</small></span>
      </section>
      {selectedService && (
        <section className="storefront-service-page" id="services">
          <a href={`/p/?business=${encodeURIComponent(slug)}#services`}>← All services</a>
          <div>
            <div>
              <span>Professional service</span>
              <h1>{selectedService.pageHeadline}</h1>
              <p>{selectedService.pageBody}</p>
              {!!selectedService.benefits.length && (
                <ul>{selectedService.benefits.map((benefit: string) => <li key={benefit}>{benefit}</li>)}</ul>
              )}
              {selectedService.startingPrice && <strong>{selectedService.startingPrice}</strong>}
              <a href="#request">Request {selectedService.name}</a>
            </div>
            {selectedService.imageUrl && <img src={selectedService.imageUrl} alt={selectedService.name} />}
          </div>
        </section>
      )}
      {!selectedService && <section className="storefront-services" id="services">
        <span>Full-service support, right when you need it</span>
        <h2>How can we help?</h2>
        <p className="storefront-section-intro">Explore our most requested services, then schedule online or call to speak with a local professional.</p>
        <div>
          {data.services.map((service: any) => (
            <article key={service.id}>
              {service.imageUrl && <img src={service.imageUrl} alt={service.name} />}
              <div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                {service.startingPrice && <strong>{service.startingPrice}</strong>}
                <a className="storefront-service-link" href={`/p/?business=${encodeURIComponent(slug)}&service=${encodeURIComponent(service.id)}`}>View service details →</a>
              </div>
            </article>
          ))}
        </div>
      </section>}
      <section className="storefront-reputation">
        <div>
          <span>Why customers call us</span>
          <h2>Service built around your peace of mind</h2>
          <p>From the first call through the final walkthrough, our team keeps you informed and treats your property with care.</p>
        </div>
        <blockquote>
          <span aria-hidden="true">“</span>
          <p>Prompt communication, professional workmanship, and a straightforward service experience—every visit, every time.</p>
          <strong>{data.companyName}</strong>
        </blockquote>
      </section>
      <section className="storefront-request" id="request">
        <div>
          <span>Let&apos;s get started</span>
          <h2>Schedule your service today</h2>
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
        <div>
          <strong>{data.companyName}</strong>
          <p>{data.description || 'Professional local service for your home or business.'}</p>
        </div>
        <div>
          <small>Contact</small>
          {data.contactPhone && <a href={`tel:${data.contactPhone}`}>{data.contactPhone}</a>}
          {data.contactEmail && <a href={`mailto:${data.contactEmail}`}>{data.contactEmail}</a>}
        </div>
        <div>
          <small>Service area</small>
          <span>{data.serviceArea || 'Contact us for availability'}</span>
          <span>{data.hours}</span>
        </div>
        <p>Powered by ServicePro</p>
      </footer>
    </main>
  );
}
