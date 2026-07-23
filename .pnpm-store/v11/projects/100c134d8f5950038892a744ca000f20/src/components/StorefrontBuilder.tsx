'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';

type Service = {
  id: string;
  code: string;
  name: string;
  description?: string;
};

type ServicePresentation = {
  title?: string;
  description?: string;
  imageUrl?: string;
  pageHeadline?: string;
  pageBody?: string;
  benefits?: string;
};

function suggestedPresentation(service: Service): ServicePresentation {
  const name = service.name.trim();
  return {
    title: name,
    description: service.description || `Professional ${name.toLowerCase()} delivered by experienced local specialists.`,
    pageHeadline: `${name} you can depend on`,
    pageBody: `Get dependable ${name.toLowerCase()} from a team focused on quality workmanship, clear communication, and a smooth customer experience from request through completion.`,
    benefits: `Experienced service professionals\nClear scheduling and communication\nQuality work tailored to your needs`,
  };
}

export function StorefrontBuilder() {
  const [settings, setSettings] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [servicePresentation, setServicePresentation] = useState<Record<string, ServicePresentation>>({});
  const [message, setMessage] = useState('');
  const [addingService, setAddingService] = useState(false);
  const [starterPack, setStarterPack] = useState<any>(null);
  const [addingStarters, setAddingStarters] = useState(false);
  const [published, setPublished] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [unpublishedAt, setUnpublishedAt] = useState('');

  useEffect(() => {
    Promise.all([
      authFetch('/api/v1/tenant/settings').then((response) => response.json()),
      authFetch('/api/v1/services').then((response) => response.json()),
      authFetch('/api/v1/storefront/themes').then((response) => response.json()),
      authFetch('/api/v1/storefront/starter-services').then((response) => response.json()),
    ]).then(([settingsResponse, servicesResponse, themesResponse, starterResponse]) => {
      setSettings(settingsResponse.data);
      setServices(servicesResponse.data || []);
      setThemes(themesResponse.data || []);
      setSelectedServiceIds(settingsResponse.data?.branding?.publicServiceIds || []);
      const stored = settingsResponse.data?.branding?.publicServicePresentation || {};
      const suggestions = Object.fromEntries(
        (servicesResponse.data || []).map((service: Service) => [
          service.id,
          { ...suggestedPresentation(service), ...(stored[service.id] || {}) },
        ]),
      );
      setServicePresentation(suggestions);
      setStarterPack(starterResponse.data || null);
      setPublished(settingsResponse.data?.branding?.publicPublished === true);
      setPublishedAt(settingsResponse.data?.branding?.publicPublishedAt || '');
      setUnpublishedAt(settingsResponse.data?.branding?.publicUnpublishedAt || '');
    });
  }, []);

  function toggleService(serviceId: string) {
    setDirty(true);
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  async function addStarterServices() {
    if (!starterPack?.services?.length) return;
    setAddingStarters(true);
    setMessage('');
    const created: Service[] = [];
    const failures: string[] = [];
    for (const suggestion of starterPack.services) {
      const response = await authFetch('/api/v1/services', {
        method: 'POST',
        body: JSON.stringify({
          ...suggestion,
          category: 'public',
          basePrice: 0,
          unitCost: 0,
          taxable: true,
          active: true,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.data?.id) created.push(body.data);
      else failures.push(suggestion.name);
    }
    setAddingStarters(false);
    if (created.length) {
      setDirty(true);
      setServices((current) => [...current, ...created]);
      setSelectedServiceIds((current) => [...new Set([...current, ...created.map((service) => service.id)])]);
      setServicePresentation((current) => ({
        ...current,
        ...Object.fromEntries(created.map((service) => [service.id, suggestedPresentation(service)])),
      }));
    }
    setMessage(
      created.length
        ? `${created.length} suggested service pages were created and selected. Save the storefront to publish them.`
        : `No pages were created. ${failures.length ? 'The suggested services may already exist in the catalog.' : ''}`,
    );
  }

  function updatePresentation(serviceId: string, field: keyof ServicePresentation, value: string) {
    setDirty(true);
    setServicePresentation((current) => ({
      ...current,
      [serviceId]: { ...(current[serviceId] || {}), [field]: value },
    }));
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
    setServicePresentation((current) => ({
      ...current,
      [body.data.id]: suggestedPresentation(body.data),
    }));
    setMessage(`${body.data.name} was added and selected. Save the storefront to publish it.`);
    form.reset();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const branding = {
      publicSlug: form.get('slug'),
      publicPublished: published,
      publicTheme: form.get('theme'),
      publicTagline: form.get('tagline'),
      publicDescription: form.get('description'),
      publicServiceArea: form.get('serviceArea'),
      publicHours: form.get('hours'),
      logoUrl: form.get('logoUrl'),
      heroImageUrl: form.get('heroImageUrl') || '/storefront/field-service-hero.png',
      publicServiceIds: selectedServiceIds,
      publicServicePresentation: servicePresentation,
    };
    const response = await authFetch('/api/v1/tenant/branding', {
      method: 'PATCH',
      body: JSON.stringify(branding),
    });
    const responseBody = await response.json().catch(() => ({}));
    setMessage(response.ok ? (published ? 'Changes are live on the public storefront.' : 'Draft saved. The storefront is not publicly available.') : 'Unable to save storefront.');
    if (response.ok) {
      const savedBranding = responseBody.data || branding;
      setSettings((current: any) => ({ ...current, branding: savedBranding }));
      setPublishedAt(savedBranding.publicPublishedAt || '');
      setUnpublishedAt(savedBranding.publicUnpublishedAt || '');
      setDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    }
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

      <nav className="storefront-builder-breadcrumbs" aria-label="Storefront builder breadcrumb">
        <a href="/dashboard/">Workspace</a><span>/</span><strong>Storefront Builder</strong><span>/</span><span>Edit public site</span>
      </nav>
      <nav className="storefront-builder-tabs" aria-label="Storefront builder sections">
        <a href="#storefront-branding"><span>1</span>Branding</a>
        <a href="#storefront-services"><span>2</span>Services &amp; Pages <small>{selectedServiceIds.length}</small></a>
        <a href="#storefront-publish"><span>3</span>Publish &amp; Preview</a>
      </nav>

      {message && <p className="storefront-message">{message}</p>}
      <section id="storefront-publish" className={`storefront-publish-status ${published ? 'live' : 'draft'}`}>
        <div>
          <span>{published ? 'Live storefront' : 'Unpublished draft'}</span>
          <strong>{dirty ? 'You have unsaved changes' : 'All changes are saved'}</strong>
          <small>
            {published && publishedAt
              ? `Published ${new Date(publishedAt).toLocaleString()}`
              : !published && unpublishedAt
                ? `Unpublished ${new Date(unpublishedAt).toLocaleString()}`
                : lastSavedAt
                  ? `Last saved at ${lastSavedAt}`
                  : 'Changes appear publicly only after you save.'}
          </small>
        </div>
        {branding.publicSlug && published && <a target="_blank" href={`/p/?business=${encodeURIComponent(branding.publicSlug)}`}>View live storefront</a>}
      </section>

      <form className="storefront-service-add" id="add-service-page" onSubmit={addService}>
        <div>
          <span className="storefront-add-kicker">Additional public page</span>
          <h3>Add another service page</h3>
          <p>Create a service, generate its editable public page, and select it for storefront visibility. Save the storefront afterward to publish it.</p>
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
          {addingService ? 'Creating page...' : 'Create and select service page'}
        </button>
      </form>

      {starterPack?.services?.length > 0 && (
        <section className="storefront-starter-pack">
          <div>
            <h3>{starterPack.siteType?.name || 'Service business'} suggested pages</h3>
            <p>Create a relevant starter catalog and editable public page for each suggested service.</p>
          </div>
          <ul>{starterPack.services.map((service: any) => <li key={service.code}>{service.name}</li>)}</ul>
          <button className="button button-small" type="button" disabled={addingStarters} onClick={() => void addStarterServices()}>
            {addingStarters ? 'Creating pages...' : 'Create suggested service pages'}
          </button>
        </section>
      )}

      <form onSubmit={save} onChange={() => setDirty(true)}>
        <section className="storefront-builder-section" id="storefront-branding">
          <header><span>Branding</span><h3>Business identity and public appearance</h3><p>Choose the public address, theme, company message, and images.</p></header>
          <div className="form-columns">
          <label>
            Public URL slug
            <input name="slug" defaultValue={branding.publicSlug || ''} placeholder="your-business" pattern="[A-Za-z0-9 -]+" required />
            <small>Saved as a lowercase URL, for example: plumber</small>
          </label>
          <label>
            Theme
            <select name="theme" defaultValue={branding.publicTheme || 'evergreen'}>
              {themes.map((theme) => <option value={theme.slug} key={theme.slug}>{theme.name}</option>)}
            </select>
          </label>
        </div>
          <label className="publish-toggle">
          <input type="checkbox" name="published" checked={published} onChange={(event) => { setPublished(event.target.checked); setDirty(true); }} />
          {published ? 'Published — saving changes updates the live website' : 'Publish this storefront'}
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
        </section>
        <fieldset id="storefront-services">
          <div className="storefront-service-toolbar">
            <legend>Visible public services</legend>
            <span>{selectedServiceIds.length} of {services.length} selected</span>
            <a href="#add-service-page">+ Add service page</a>
            <button type="button" onClick={() => { setSelectedServiceIds(services.map((service) => service.id)); setDirty(true); }}>Select all</button>
            <button type="button" onClick={() => { setSelectedServiceIds([]); setDirty(true); }}>Clear all</button>
          </div>
          <div className="storefront-service-checks">
            {services.map((service) => (
              <article className={selectedServiceIds.includes(service.id) ? 'selected' : ''} key={service.id}>
                <label className="storefront-service-select">
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  <span><strong>{service.name}</strong><small>{service.code}</small></span>
                </label>
                {selectedServiceIds.includes(service.id) && (
                  <div className="storefront-service-design">
                    {branding.publicSlug && published && <a className="storefront-service-preview" target="_blank" href={`/p/?business=${encodeURIComponent(branding.publicSlug)}&service=${encodeURIComponent(service.id)}`}>Preview this service page</a>}
                    {servicePresentation[service.id]?.imageUrl && (
                      <img src={servicePresentation[service.id].imageUrl} alt="" />
                    )}
                    <label>
                      Public title
                      <input
                        value={servicePresentation[service.id]?.title || ''}
                        placeholder={service.name}
                        onChange={(event) => updatePresentation(service.id, 'title', event.target.value)}
                      />
                    </label>
                    <label>
                      Service image URL
                      <input
                        type="url"
                        value={servicePresentation[service.id]?.imageUrl || ''}
                        placeholder="https://example.com/service.jpg"
                        onChange={(event) => updatePresentation(service.id, 'imageUrl', event.target.value)}
                      />
                    </label>
                    <label>
                      Public marketing text
                      <textarea
                        rows={3}
                        value={servicePresentation[service.id]?.description || ''}
                        placeholder={service.description || 'Describe this service for prospective customers.'}
                        onChange={(event) => updatePresentation(service.id, 'description', event.target.value)}
                      />
                    </label>
                    <label>
                      Service page headline
                      <input
                        value={servicePresentation[service.id]?.pageHeadline || ''}
                        onChange={(event) => updatePresentation(service.id, 'pageHeadline', event.target.value)}
                      />
                    </label>
                    <label>
                      Service page details
                      <textarea
                        rows={4}
                        value={servicePresentation[service.id]?.pageBody || ''}
                        onChange={(event) => updatePresentation(service.id, 'pageBody', event.target.value)}
                      />
                    </label>
                    <label>
                      Suggested benefits (one per line)
                      <textarea
                        rows={4}
                        value={servicePresentation[service.id]?.benefits || ''}
                        onChange={(event) => updatePresentation(service.id, 'benefits', event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </article>
            ))}
            {!services.length && <p>No catalog services yet. Add the first one above.</p>}
          </div>
        </fieldset>
        <div className="storefront-save-bar">
          <span>{published ? 'Saving will update the public website immediately.' : 'Saving will keep this storefront private.'}</span>
          <button className="button">{published ? 'Save & publish changes' : 'Save draft'}</button>
        </div>
      </form>
    </section>
  );
}
