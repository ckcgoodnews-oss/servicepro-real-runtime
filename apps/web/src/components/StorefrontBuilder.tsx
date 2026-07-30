'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';
import { suggestedServiceImage } from '@/data/serviceImageLibrary';

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
  const image = suggestedServiceImage(name);
  return {
    title: name,
    description: service.description || `Professional ${name.toLowerCase()} delivered by experienced local specialists.`,
    imageUrl: image?.value || '',
    pageHeadline: `${name} you can depend on`,
    pageBody: `Get dependable ${name.toLowerCase()} from a team focused on quality workmanship, clear communication, and a smooth customer experience from request through completion.`,
    benefits: `Experienced service professionals\nClear scheduling and communication\nQuality work tailored to your needs`,
  };
}

const INDUSTRY_IMAGE_OPTIONS = [
  { value: '/storefront/industries/appliance-repair.svg', label: 'Appliance Repair' },
  { value: '/storefront/industries/carpet-cleaning.svg', label: 'Carpet & Upholstery' },
  { value: '/storefront/industries/chimney-fireplace.svg', label: 'Chimney & Fireplace' },
  { value: '/storefront/industries/commercial-cleaning.svg', label: 'Commercial Janitorial' },
  { value: '/storefront/industries/electrical.svg', label: 'Electrical' },
  { value: '/storefront/industries/fencing.svg', label: 'Fencing' },
  { value: '/storefront/industries/flooring.svg', label: 'Flooring' },
  { value: '/storefront/industries/garage-door.svg', label: 'Garage Door' },
  { value: '/storefront/industries/handyman.svg', label: 'Handyman' },
  { value: '/storefront/industries/home-inspection.svg', label: 'Home Inspection' },
  { value: '/storefront/industries/hvac.svg', label: 'HVAC' },
  { value: '/storefront/industries/irrigation.svg', label: 'Irrigation' },
  { value: '/storefront/industries/junk-removal.svg', label: 'Junk Removal' },
  { value: '/storefront/industries/landscaping.svg', label: 'Landscaping' },
  { value: '/storefront/industries/locksmith-security.svg', label: 'Locksmith & Security' },
  { value: '/storefront/industries/moving.svg', label: 'Moving Services' },
  { value: '/storefront/industries/painting.svg', label: 'Painting' },
  { value: '/storefront/industries/pest-control.svg', label: 'Pest Control' },
  { value: '/storefront/industries/plumbing.svg', label: 'Plumbing' },
  { value: '/storefront/industries/pool-spa.svg', label: 'Pool & Spa' },
  { value: '/storefront/industries/pressure-washing.svg', label: 'Pressure Washing' },
  { value: '/storefront/industries/property-maintenance.svg', label: 'Property Maintenance' },
  { value: '/storefront/industries/residential-cleaning.svg', label: 'Residential Cleaning' },
  { value: '/storefront/industries/restoration.svg', label: 'Restoration' },
  { value: '/storefront/industries/roofing.svg', label: 'Roofing' },
  { value: '/storefront/industries/septic.svg', label: 'Septic & Wastewater' },
  { value: '/storefront/industries/snow-removal.svg', label: 'Snow & Ice' },
  { value: '/storefront/industries/solar.svg', label: 'Solar' },
  { value: '/storefront/industries/tree-care.svg', label: 'Tree Care' },
  { value: '/storefront/industries/window-gutter.svg', label: 'Window & Gutter' },
];

const SERVICE_IMAGE_OPTIONS = [
  { industry: 'Appliance Repair', images: [
    { value: '/storefront/services/pack-appliance-repair/model-diagnostics.jpg', label: 'Model Diagnostics' },
    { value: '/storefront/services/pack-appliance-repair/parts-tracking.jpg', label: 'Parts Tracking' },
    { value: '/storefront/services/pack-appliance-repair/warranty-service.jpg', label: 'Warranty Service' },
  ]},
  { industry: 'Carpet & Upholstery', images: [
    { value: '/storefront/services/pack-carpet/room-based-estimates.jpg', label: 'Room-Based Estimates' },
    { value: '/storefront/services/pack-carpet/treatment-tracking.jpg', label: 'Treatment Tracking' },
    { value: '/storefront/services/pack-carpet/recurring-service.jpg', label: 'Recurring Service' },
  ]},
  { industry: 'Chimney & Fireplace', images: [
    { value: '/storefront/services/pack-chimney-fireplace/inspection-levels.jpg', label: 'Inspection Levels' },
    { value: '/storefront/services/pack-chimney-fireplace/sweeping-records.jpg', label: 'Sweeping Records' },
    { value: '/storefront/services/pack-chimney-fireplace/safety-findings.jpg', label: 'Safety Findings' },
  ]},
  { industry: 'Commercial Janitorial', images: [
    { value: '/storefront/services/pack-commercial-cleaning/facility-zones.jpg', label: 'Facility Zones' },
    { value: '/storefront/services/pack-commercial-cleaning/quality-inspections.jpg', label: 'Quality Inspections' },
    { value: '/storefront/services/pack-commercial-cleaning/supply-controls.jpg', label: 'Supply Controls' },
  ]},
  { industry: 'Electrical', images: [
    { value: '/storefront/services/pack-electrical/panel-schedules.jpg', label: 'Panel Schedules' },
    { value: '/storefront/services/pack-electrical/electrical-inspections.jpg', label: 'Electrical Inspections' },
    { value: '/storefront/services/pack-electrical/permit-tracking.jpg', label: 'Permit Tracking' },
  ]},
  { industry: 'Fencing', images: [
    { value: '/storefront/services/pack-fencing/linear-estimates.jpg', label: 'Linear Estimates' },
    { value: '/storefront/services/pack-fencing/material-layouts.jpg', label: 'Material Layouts' },
    { value: '/storefront/services/pack-fencing/gate-hardware.jpg', label: 'Gate Hardware' },
  ]},
  { industry: 'Flooring', images: [
    { value: '/storefront/services/pack-flooring/room-takeoffs.jpg', label: 'Room Takeoffs' },
    { value: '/storefront/services/pack-flooring/waste-factors.jpg', label: 'Waste Factors' },
    { value: '/storefront/services/pack-flooring/install-milestones.jpg', label: 'Install Milestones' },
  ]},
  { industry: 'Garage Door', images: [
    { value: '/storefront/services/pack-garage-door/door-assets.jpg', label: 'Door Assets' },
    { value: '/storefront/services/pack-garage-door/safety-checks.jpg', label: 'Safety Checks' },
    { value: '/storefront/services/pack-garage-door/spring-lifecycle.jpg', label: 'Spring Lifecycle' },
  ]},
  { industry: 'Handyman', images: [
    { value: '/storefront/services/pack-handyman/multi-task-jobs.jpg', label: 'Multi-Task Jobs' },
    { value: '/storefront/services/pack-handyman/project-punch-lists.jpg', label: 'Project Punch Lists' },
    { value: '/storefront/services/pack-handyman/flexible-estimates.jpg', label: 'Flexible Estimates' },
  ]},
  { industry: 'Home Inspection', images: [
    { value: '/storefront/services/pack-home-inspection/structured-findings.jpg', label: 'Structured Findings' },
    { value: '/storefront/services/pack-home-inspection/photo-evidence.jpg', label: 'Photo Evidence' },
    { value: '/storefront/services/pack-home-inspection/client-reports.jpg', label: 'Client Reports' },
  ]},
  { industry: 'HVAC', images: [
    { value: '/storefront/services/pack-hvac/heating-and-cooling.jpg', label: 'Heating & Cooling' },
    { value: '/storefront/services/pack-hvac/maintenance-agreements.jpg', label: 'Maintenance Agreements' },
    { value: '/storefront/services/pack-hvac/equipment-commissioning.jpg', label: 'Equipment Commissioning' },
  ]},
  { industry: 'Irrigation', images: [
    { value: '/storefront/services/pack-irrigation/zone-maps.jpg', label: 'Zone Maps' },
    { value: '/storefront/services/pack-irrigation/controller-records.jpg', label: 'Controller Records' },
    { value: '/storefront/services/pack-irrigation/winterization.jpg', label: 'Winterization' },
  ]},
  { industry: 'Junk Removal', images: [
    { value: '/storefront/services/pack-junk-removal/volume-pricing.jpg', label: 'Volume Pricing' },
    { value: '/storefront/services/pack-junk-removal/load-capacity.jpg', label: 'Load Capacity' },
    { value: '/storefront/services/pack-junk-removal/disposal-tracking.jpg', label: 'Disposal Tracking' },
  ]},
  { industry: 'Landscaping', images: [
    { value: '/storefront/services/pack-landscape/property-zones.jpg', label: 'Property Zones' },
    { value: '/storefront/services/pack-landscape/crew-routing.jpg', label: 'Crew Routing' },
    { value: '/storefront/services/pack-landscape/seasonal-work.jpg', label: 'Seasonal Work' },
  ]},
  { industry: 'Locksmith & Security', images: [
    { value: '/storefront/services/pack-locksmith-security/key-records.jpg', label: 'Key Records' },
    { value: '/storefront/services/pack-locksmith-security/access-control.jpg', label: 'Access Control' },
    { value: '/storefront/services/pack-locksmith-security/security-hardware.jpg', label: 'Security Hardware' },
  ]},
  { industry: 'Moving Services', images: [
    { value: '/storefront/services/pack-moving/inventory-surveys.jpg', label: 'Inventory Surveys' },
    { value: '/storefront/services/pack-moving/truck-planning.jpg', label: 'Truck Planning' },
    { value: '/storefront/services/pack-moving/delivery-proof.jpg', label: 'Delivery Proof' },
  ]},
  { industry: 'Painting', images: [
    { value: '/storefront/services/pack-painting/color-schedules.jpg', label: 'Color Schedules' },
    { value: '/storefront/services/pack-painting/surface-measurements.jpg', label: 'Surface Measurements' },
    { value: '/storefront/services/pack-painting/paint-usage.jpg', label: 'Paint Usage' },
  ]},
  { industry: 'Pest Control', images: [
    { value: '/storefront/services/pack-pest-control/treatment-records.jpg', label: 'Treatment Records' },
    { value: '/storefront/services/pack-pest-control/device-monitoring.jpg', label: 'Device Monitoring' },
    { value: '/storefront/services/pack-pest-control/compliance-logs.jpg', label: 'Compliance Logs' },
  ]},
  { industry: 'Plumbing', images: [
    { value: '/storefront/services/pack-plumbing/drain-and-sewer.jpg', label: 'Drain & Sewer' },
    { value: '/storefront/services/pack-plumbing/water-heaters.jpg', label: 'Water Heaters' },
    { value: '/storefront/services/pack-plumbing/fixture-service.jpg', label: 'Fixture Service' },
  ]},
  { industry: 'Pool & Spa', images: [
    { value: '/storefront/services/pack-pool-spa/chemistry-logs.jpg', label: 'Chemistry Logs' },
    { value: '/storefront/services/pack-pool-spa/route-service.jpg', label: 'Route Service' },
    { value: '/storefront/services/pack-pool-spa/seasonal-care.jpg', label: 'Seasonal Care' },
  ]},
  { industry: 'Pressure Washing', images: [
    { value: '/storefront/services/pack-pressure-washing/area-based-pricing.jpg', label: 'Area-Based Pricing' },
    { value: '/storefront/services/pack-pressure-washing/chemical-tracking.jpg', label: 'Chemical Tracking' },
    { value: '/storefront/services/pack-pressure-washing/photo-documentation.jpg', label: 'Photo Documentation' },
  ]},
  { industry: 'Property Maintenance', images: [
    { value: '/storefront/services/pack-property-maintenance/multi-site-assets.jpg', label: 'Multi-Site Assets' },
    { value: '/storefront/services/pack-property-maintenance/preventive-plans.jpg', label: 'Preventive Plans' },
    { value: '/storefront/services/pack-property-maintenance/owner-reporting.jpg', label: 'Owner Reporting' },
  ]},
  { industry: 'Residential Cleaning', images: [
    { value: '/storefront/services/pack-residential-cleaning/room-checklists.jpg', label: 'Room Checklists' },
    { value: '/storefront/services/pack-residential-cleaning/recurring-plans.jpg', label: 'Recurring Plans' },
    { value: '/storefront/services/pack-residential-cleaning/customer-preferences.jpg', label: 'Customer Preferences' },
  ]},
  { industry: 'Restoration', images: [
    { value: '/storefront/services/pack-restoration/moisture-mapping.jpg', label: 'Moisture Mapping' },
    { value: '/storefront/services/pack-restoration/equipment-logs.jpg', label: 'Equipment Logs' },
    { value: '/storefront/services/pack-restoration/loss-documentation.jpg', label: 'Loss Documentation' },
  ]},
  { industry: 'Roofing', images: [
    { value: '/storefront/services/pack-roofing/roof-diagrams.jpg', label: 'Roof Diagrams' },
    { value: '/storefront/services/pack-roofing/material-takeoffs.jpg', label: 'Material Takeoffs' },
    { value: '/storefront/services/pack-roofing/claims-documentation.jpg', label: 'Claims Documentation' },
  ]},
  { industry: 'Septic & Wastewater', images: [
    { value: '/storefront/services/pack-septic/system-assets.jpg', label: 'System Assets' },
    { value: '/storefront/services/pack-septic/pumping-history.jpg', label: 'Pumping History' },
    { value: '/storefront/services/pack-septic/disposal-records.jpg', label: 'Disposal Records' },
  ]},
  { industry: 'Snow & Ice', images: [
    { value: '/storefront/services/pack-snow-removal/storm-dispatch.jpg', label: 'Storm Dispatch' },
    { value: '/storefront/services/pack-snow-removal/salt-usage.jpg', label: 'Salt Usage' },
    { value: '/storefront/services/pack-snow-removal/proof-of-service.jpg', label: 'Proof of Service' },
  ]},
  { industry: 'Solar', images: [
    { value: '/storefront/services/pack-solar/system-commissioning.jpg', label: 'System Commissioning' },
    { value: '/storefront/services/pack-solar/production-checks.jpg', label: 'Production Checks' },
    { value: '/storefront/services/pack-solar/battery-service.jpg', label: 'Battery Service' },
  ]},
  { industry: 'Tree Care', images: [
    { value: '/storefront/services/pack-tree-care/tree-inventory.jpg', label: 'Tree Inventory' },
    { value: '/storefront/services/pack-tree-care/risk-assessments.jpg', label: 'Risk Assessments' },
    { value: '/storefront/services/pack-tree-care/treatment-plans.jpg', label: 'Treatment Plans' },
  ]},
  { industry: 'Window & Gutter', images: [
    { value: '/storefront/services/pack-window-gutter/measurement-pricing.jpg', label: 'Measurement Pricing' },
    { value: '/storefront/services/pack-window-gutter/access-notes.jpg', label: 'Access Notes' },
    { value: '/storefront/services/pack-window-gutter/recurring-routes.jpg', label: 'Recurring Routes' },
  ]},
];

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
    const created: Array<{ service: Service; imageUrl?: string }> = [];
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
      if (response.ok && body.data?.id) created.push({ service: body.data, imageUrl: suggestion.imageUrl });
      else failures.push(suggestion.name);
    }
    setAddingStarters(false);
    if (created.length) {
      setDirty(true);
      setServices((current) => [...current, ...created.map(c => c.service)]);
      setSelectedServiceIds((current) => [...new Set([...current, ...created.map(c => c.service.id)])]);
      setServicePresentation((current) => ({
        ...current,
        ...Object.fromEntries(created.map(c => [c.service.id, { ...suggestedPresentation(c.service), imageUrl: c.imageUrl || '' }])),
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
      logoUrl: (form.get('logoUrl') === 'custom' ? form.get('logoUrlCustom') : form.get('logoUrl')) || '',
      heroImageUrl: (form.get('heroImageUrl') === 'custom' ? form.get('heroImageUrlCustom') : form.get('heroImageUrl')) || '/storefront/field-service-hero.png',
      publicServiceIds: selectedServiceIds,
      publicServicePresentation: servicePresentation,
    };
    const response = await authFetch('/api/v1/tenant/branding', {
      method: 'PATCH',
      body: JSON.stringify(branding),
    });
    const responseBody = await response.json().catch(() => ({}));
    // Always update company name from form
    const newCompanyName = String(form.get('companyName') || '').trim();
    if (newCompanyName) {
      await authFetch('/api/v1/tenant/settings', {
        method: 'PATCH',
        body: JSON.stringify({ companyName: newCompanyName }),
      });
      setSettings((current: any) => ({ ...current, companyName: newCompanyName }));
    }
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

      {branding.publicSlug && published && (
        <a
          className="button button-small storefront-view-page-sticky"
          target="_blank"
          href={`/p/?business=${encodeURIComponent(branding.publicSlug)}`}
        >
          View page ↗
        </a>
      )}
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
        <button type="button" className="button button-small" onClick={() => { (document.getElementById('storefront-form') as HTMLFormElement)?.requestSubmit(); }}>{published ? 'Save & publish' : 'Save draft'}</button>
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

      <form id="storefront-form" onSubmit={save} onChange={() => setDirty(true)}>
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
          <label>Business name (displayed as page heading)<input name="companyName" defaultValue={settings?.companyName || ''} key={settings?.companyName || 'cn'} onChange={() => setDirty(true)} /></label>
          <label>Headline<input name="tagline" defaultValue={branding.publicTagline || ''} /></label>
          <label>Business description<textarea name="description" defaultValue={branding.publicDescription || ''} rows={4} /></label>
          <div className="form-columns">
          <label>Service area<input name="serviceArea" defaultValue={branding.publicServiceArea || ''} /></label>
          <label>Operating hours<input name="hours" defaultValue={branding.publicHours || ''} /></label>
          </div>
          <div className="form-columns">
          <label>Logo URL<select name="logoUrl" defaultValue={(branding.logoUrl && !branding.logoUrl.startsWith('/storefront/')) ? 'custom' : (branding.logoUrl || '')} onChange={(e) => { const custom = e.currentTarget.parentElement?.querySelector('input[name="logoUrlCustom"]') as HTMLInputElement; if (custom) custom.style.display = e.target.value === 'custom' ? 'block' : 'none'; }}>
            <option value="">None (text only)</option>
            <optgroup label="Industry Logos">
              {INDUSTRY_IMAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </optgroup>
            <optgroup label="Custom">
              <option value="custom">Enter custom URL...</option>
            </optgroup>
          </select><input name="logoUrlCustom" type="url" placeholder="https://example.com/logo.png" style={{display: (branding.logoUrl && !branding.logoUrl.startsWith('/storefront/')) ? 'block' : 'none'}} defaultValue={(branding.logoUrl && !branding.logoUrl.startsWith('/storefront/')) ? branding.logoUrl : ''} /></label>
          <label>Hero image URL<select name="heroImageUrl" defaultValue={(branding.heroImageUrl && !branding.heroImageUrl.startsWith('/storefront/')) ? 'custom' : (branding.heroImageUrl || '/storefront/field-service-hero.png')} onChange={(e) => { const custom = e.currentTarget.parentElement?.querySelector('input[name="heroImageUrlCustom"]') as HTMLInputElement; if (custom) custom.style.display = e.target.value === 'custom' ? 'block' : 'none'; }}>
            <optgroup label="Industry Images">
              {INDUSTRY_IMAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </optgroup>
            <optgroup label="General">
              <option value="/storefront/field-service-hero.png">Default Field Service</option>
            </optgroup>
            <optgroup label="Custom">
              <option value="custom">Enter custom URL...</option>
            </optgroup>
          </select><input name="heroImageUrlCustom" type="url" placeholder="https://example.com/hero.jpg" style={{display: (branding.heroImageUrl && !branding.heroImageUrl.startsWith('/storefront/')) ? 'block' : 'none'}} defaultValue={(branding.heroImageUrl && !branding.heroImageUrl.startsWith('/storefront/')) ? branding.heroImageUrl : ''} /></label>
          </div>
        </section>
        <div className="storefront-save-bar" style={{marginBottom: '8px'}}>
          <span>{dirty ? 'You have unsaved changes' : ''}</span>
          <button type="submit" className="button button-small">{published ? 'Save & publish' : 'Save draft'}</button>
        </div>
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
                      Service image
                      <select
                        value={(servicePresentation[service.id]?.imageUrl && !(servicePresentation[service.id]?.imageUrl ?? '').startsWith('/storefront/')) ? 'custom' : (servicePresentation[service.id]?.imageUrl || '')}
                        onChange={(event) => {
                          if (event.target.value === 'custom') return;
                          updatePresentation(service.id, 'imageUrl', event.target.value);
                        }}
                      >
                        <option value="">None</option>
                        {SERVICE_IMAGE_OPTIONS.map(group => (
                          <optgroup key={group.industry} label={group.industry}>
                            {group.images.map(img => <option key={img.value} value={img.value}>{img.label}</option>)}
                          </optgroup>
                        ))}
                        <optgroup label="Industry Hero Images">
                          {INDUSTRY_IMAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label} (Hero)</option>)}
                        </optgroup>
                        <option value="custom">Custom URL...</option>
                      </select>
                      {(servicePresentation[service.id]?.imageUrl === 'custom' || (servicePresentation[service.id]?.imageUrl && !(servicePresentation[service.id]?.imageUrl ?? '').startsWith('/storefront/'))) && (
                        <input
                          type="url"
                          value={servicePresentation[service.id]?.imageUrl === 'custom' ? '' : (servicePresentation[service.id]?.imageUrl || '')}
                          placeholder="https://example.com/service.jpg"
                          onChange={(event) => updatePresentation(service.id, 'imageUrl', event.target.value)}
                        />
                      )}
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
          <button type="submit" className="button">{published ? 'Save & publish changes' : 'Save draft'}</button>
          <button type="button" className="button-small" style={{background:'var(--red)',color:'white',marginLeft:'auto'}} onClick={async () => {
            if (!confirm('Delete this public storefront? This will remove your public page and all storefront settings. Your services and business data are not affected.')) return;
            const response = await authFetch('/api/v1/tenant/branding', {
              method: 'PATCH',
              body: JSON.stringify({
                publicSlug: '',
                publicPublished: false,
                publicTagline: '',
                publicDescription: '',
                publicServiceArea: '',
                publicHours: '',
                logoUrl: '',
                heroImageUrl: '',
                publicServiceIds: [],
                publicServicePresentation: {},
                publicPublishedAt: '',
                publicUnpublishedAt: new Date().toISOString(),
              }),
            });
            if (response.ok) {
              setPublished(false);
              setSelectedServiceIds([]);
              setServicePresentation({});
              setSettings((current: any) => ({ ...current, branding: {} }));
              setMessage('Storefront deleted. Your public page is no longer accessible.');
              setDirty(false);
            } else {
              setMessage('Unable to delete storefront. Try again.');
            }
          }}>Delete storefront</button>
        </div>
      </form>
    </section>
  );
}
