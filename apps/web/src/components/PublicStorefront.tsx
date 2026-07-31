'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiUrl } from '@/auth/session';

function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    const elements = document.querySelectorAll(
      '.storefront-reveal, .storefront-reveal-left, .storefront-reveal-right, .storefront-reveal-scale, .storefront-services article, .storefront-why-grid article, .storefront-service-page img'
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

export function PublicStorefront() {
  const [data, setData] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [financingSent, setFinancingSent] = useState(false);

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
        fetch(apiUrl(`/api/public/blog/${encodeURIComponent(value)}`))
          .then(r => r.ok ? r.json() : { data: [] })
          .then(body => setBlogPosts(body.data || []))
          .catch(() => {});
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

  async function submitFinancing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(apiUrl(`/api/public/financing/${encodeURIComponent(slug)}`), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (response.ok) { setFinancingSent(true); event.currentTarget.reset(); }
  }

  useRevealOnScroll();

  // Auto-rotate carousel
  useEffect(() => {
    if (!data?.services?.length) return;
    const slides = data.services.filter((s: any) => s.imageUrl);
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [data]);

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
          <a href="#blog">Blog</a>
          <a href="#financing">Financing</a>
        </nav>
        <div className="storefront-header-actions">
          {data.contactPhone && <a className="storefront-call" href={`tel:${data.contactPhone}`}>📞 {data.contactPhone}</a>}
          <a className="storefront-cta-button" href="#request">Schedule Service</a>
        </div>
      </header>
      <section
        className={`storefront-hero ${selectedService ? 'storefront-hero-compact' : ''}`}
        style={{ backgroundImage: `linear-gradient(90deg,rgba(8,25,23,.9),rgba(8,25,23,.12)),url(${data.heroImageUrl})` }}
      >
        <div>
          {!selectedService && <span>Local service professionals</span>}
          <h1>{selectedService ? data.companyName : (data.tagline || `Service you can count on from ${data.companyName}.`)}</h1>
          {!selectedService && <p>{data.description}</p>}
          {!selectedService && (
            <div className="storefront-hero-ctas">
              <a className="storefront-cta-button" href="#request">Schedule Service</a>
              {data.contactPhone && <a className="storefront-call-hero" href={`tel:${data.contactPhone}`}>Or call {data.contactPhone}</a>}
            </div>
          )}
        </div>
      </section>
      <section className="storefront-trust-bar">
        <div>
          <span>⭐ Top-rated service</span>
          <span>✓ Licensed & insured</span>
          <span>🏠 Locally owned</span>
          <span>💲 Upfront pricing</span>
          {data.serviceArea && <span>📍 Serving {data.serviceArea}</span>}
        </div>
      </section>
      {!selectedService && data.services.length > 1 && (
        <section className="storefront-carousel">
          <div className="storefront-carousel-track">
            {data.services.filter((s: any) => s.imageUrl).map((service: any, i: number) => (
              <a key={service.id} className={`storefront-carousel-slide ${i === carouselIndex ? 'active' : ''}`} href={`/p/?business=${encodeURIComponent(slug)}&service=${encodeURIComponent(service.id)}`}>
                <img src={service.imageUrl} alt={service.name} />
                <div className="storefront-carousel-caption">
                  <strong>{service.name}</strong>
                  {service.startingPrice && <span>Starting at ${service.startingPrice}</span>}
                </div>
              </a>
            ))}
          </div>
          <div className="storefront-carousel-dots">
            {data.services.filter((s: any) => s.imageUrl).map((_: any, i: number) => (
              <button key={i} className={i === carouselIndex ? 'active' : ''} onClick={() => setCarouselIndex(i)} aria-label={`Show slide ${i + 1}`} />
            ))}
          </div>
        </section>
      )}
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
              {selectedService.startingPrice && <strong>{selectedService.startingPrice}</strong>}
              <a href="#request">Request {selectedService.name}</a>
            </div>
            {selectedService.imageUrl && <img src={selectedService.imageUrl} alt={selectedService.name} />}
          </div>
        </section>
      )}
      {!selectedService && <section className="storefront-services" id="services">
        <span className="storefront-reveal">What we do</span>
        <h2 className="storefront-reveal">Professional services for your property</h2>
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
      {!selectedService && blogPosts.length > 0 && (
        <section className="storefront-blog" id="blog">
          <h2 className="storefront-reveal">Latest from our blog</h2>
          <div className="storefront-blog-grid">
            {blogPosts.slice(0, 3).map((post: any) => (
              <article key={post.id} className="storefront-reveal">
                {post.imageUrl && <img src={post.imageUrl} alt="" />}
                <div>
                  {post.category && <span>{post.category}</span>}
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="storefront-why-choose">
        <h2 className="storefront-reveal">Why customers choose {data.companyName}</h2>
        <div className="storefront-why-grid">
          <article><strong>Upfront Pricing</strong><p>You approve the cost before work starts — no hidden fees or surprises.</p></article>
          <article><strong>Local & Trusted</strong><p>Family-owned and community-focused. Your neighbors already trust us.</p></article>
          <article><strong>Licensed & Insured</strong><p>All technicians are background-checked, trained, and treat your property with care.</p></article>
          <article><strong>Fast Response</strong><p>We answer when you call. Same-day and emergency service available.</p></article>
        </div>
      </section>
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
      {!selectedService && (
        <section className="storefront-financing" id="financing">
          <div>
            <span>💰 Flexible payment options</span>
            <h2 className="storefront-reveal">Financing available</h2>
            <p>Don&apos;t let budget hold you back. Apply for financing in under 2 minutes — no impact on your credit score.</p>
          </div>
          {financingSent ? (
            <div className="storefront-success"><h3>Application received!</h3><p>We&apos;ll review your application and contact you within 1 business day.</p></div>
          ) : (
            <form onSubmit={submitFinancing}>
              <div><input name="name" placeholder="Full name" required /><input name="phone" placeholder="Phone" required /></div>
              <input name="email" type="email" placeholder="Email" required />
              <div><input name="amount" type="number" min="500" step="100" placeholder="Estimated project amount ($)" required /><select name="projectType"><option value="">Project type</option><option value="repair">Repair</option><option value="replacement">Replacement</option><option value="installation">New installation</option><option value="renovation">Renovation</option></select></div>
              <textarea name="projectDescription" placeholder="Brief description of the project" rows={3} />
              <button>Check financing options</button>
            </form>
          )}
        </section>
      )}
      <footer>
        <strong>{data.companyName}</strong>
        <span>{data.contactEmail} · {data.contactPhone}</span>
        <small>Powered by ServicePro</small>
      </footer>
    </main>
  );
}
