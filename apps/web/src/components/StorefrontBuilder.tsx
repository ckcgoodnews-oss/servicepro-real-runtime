'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';

type Service = {
  id: string;
  code: string;
  name: string;
  description?: string;
};

export function StorefrontBuilder() {
  const [settings, setSettings] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    Promise.all([
      authFetch('/api/v1/tenant/settings').then((response) => response.json()),
      authFetch('/api/v1/services').then((response) => response.json()),
      authFetch('/api/v1/storefront/themes').then((response) => response.json()),
    ]).then(([settingsResponse, servicesResponse, themesResponse]) => {
      setSettings(settingsResponse.data);
      setServices(servicesResponse.data || []);
      setThemes(themesResponse.data || []);
      setSelectedServiceIds(settingsResponse.data?.branding?.publicServiceIds || []);
    });
  }, []);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  async function addService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingService(true);
    setMessage('');
    const form = event.currentTarget;
    const fields = new FormData(form);
    const response = await authFetch('/api/v1/services', {
      method: 'POST',
      body: JSON.stringify({
        code: String(fields.get('serviceCode') || '').trim(),
        name: String(fields.get('serviceName') || '').trim(),
        description: String(fields.get('serviceDescription') || '').trim(),
        category: 'public',
        basePrice: Number(fields.get('servicePrice') || 0),
        unitCost: 0,
        taxable: true,
        active: true,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setAddingService(false);

    if (!response.ok || !body.data?.id) {
      setMessage(body.error?.message || 'Unable to add the service.');
      return;
    }

    setServices((current) => [...current, body.data]);
    setSelectedServiceIds((current) => [...new Set([...current, body.data.id])]);
    setMessage(`${body.data.name} was added and selected. Save the storefront to publish it.`);
    form.reset();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const branding = {
      publicSlug: form.get('slug'),
      publicPublished: form.get('published') === 'on',
      publicTheme: form.get('theme'),
      publicTagline: form.get('tagline'),
      publicDescription: form.get('description'),
      publicServiceArea: form.get('serviceArea'),
      publicHours: form.get('hours'),
      logoUrl: form.get('logoUrl'),
      heroImageUrl: form.get('heroImageUrl') || '/storefront/field-service-hero.png',
      publicServiceIds: selectedServiceIds,
    };
    const response = await authFetch('/api/v1/tenant/branding', {
      method: 'PATCH',
      body: JSON.stringify(branding),
    });
    setMessage(response.ok ? 'Storefront saved.' : 'Unable to save storefront.');
    if (response.ok) setSettings((current: any) => ({ ...current, branding }));
  }

  if (!settings) return <section className="panel">Loading storefront builder...</section>;
  const branding = settings.branding || {};

  return (
    <section className="panel storefront-builder">
      <div className="panel-heading">
        <div>
          <h2>Public storefront</h2>
          <p>Brand the public page and choose which services prospective customers see.</p>
        </div>
        {branding.publicSlug && (
          <a
            className="button button-small"
            target="_blank"
            href={`/p/?business=${encodeURIComponent(branding.publicSlug)}`}
          >
            Preview storefront
          </a>
        )}
      </div>

      {message && <p className="storefront-message">{message}</p>}

      <form className="storefront-service-add" onSubmit={addService}>
        <div>
          <h3>Add a public service</h3>
          <p>Create an additional catalog service and select it for storefront visibility.</p>
        </div>
        <div className="form-columns">
          <label>
            Service name
            <input name="serviceName" required placeholder="Emergency plumbing" />
          </label>
          <label>
            Service code
            <input name="serviceCode" required placeholder="PLUMB-EMERGENCY" />
          </label>
        </div>
        <div className="form-columns">
          <label>
            Public description
            <input name="serviceDescription" placeholder="Fast help when you need it most" />
          </label>
          <label>
            Starting price
            <input name="servicePrice" type="number" min="0" step="0.01" defaultValue="0" />
          </label>
        </div>
        <button className="button button-small" disabled={addingService}>
          {addingService ? 'Adding...' : 'Add and select service'}
        </button>
      </form>

      <form onSubmit={save}>
        <div className="form-columns">
          <label>
            Public URL slug
            <input name="slug" defaultValue={branding.publicSlug || ''} placeholder="your-business" required />
          </label>
          <label>
            Theme
            <select name="theme" defaultValue={branding.publicTheme || 'evergreen'}>
              {themes.map((theme) => <option value={theme.slug} key={theme.slug}>{theme.name}</option>)}
            </select>
          </label>
        </div>
        <label className="publish-toggle">
          <input type="checkbox" name="published" defaultChecked={branding.publicPublished === true} />
          Publish this storefront
        </label>
        <label>Headline<input name="tagline" defaultValue={branding.publicTagline || ''} /></label>
        <label>Business description<textarea name="description" defaultValue={branding.publicDescription || ''} rows={4} /></label>
        <div className="form-columns">
          <label>Service area<input name="serviceArea" defaultValue={branding.publicServiceArea || ''} /></label>
          <label>Operating hours<input name="hours" defaultValue={branding.publicHours || ''} /></label>
        </div>
        <div className="form-columns">
          <label>Logo URL<input name="logoUrl" type="url" defaultValue={branding.logoUrl || ''} /></label>
          <label>Hero image URL<input name="heroImageUrl" defaultValue={branding.heroImageUrl || '/storefront/field-service-hero.png'} /></label>
        </div>
        <fieldset>
          <div className="storefront-service-toolbar">
            <legend>Visible public services</legend>
            <span>{selectedServiceIds.length} of {services.length} selected</span>
            <button type="button" onClick={() => setSelectedServiceIds(services.map((service) => service.id))}>Select all</button>
            <button type="button" onClick={() => setSelectedServiceIds([])}>Clear all</button>
          </div>
          <div className="storefront-service-checks">
            {services.map((service) => (
              <label key={service.id}>
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                />
                <span><strong>{service.name}</strong><small>{service.code}</small></span>
              </label>
            ))}
            {!services.length && <p>No catalog services yet. Add the first one above.</p>}
          </div>
        </fieldset>
        <button className="button">Save storefront</button>
      </form>
    </section>
  );
}
