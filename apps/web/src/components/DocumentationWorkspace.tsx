'use client';

import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/auth/session';

type Audience = 'platform_admin' | 'owner' | 'staff';
type Section = { heading: string; body: string; steps?: string[]; code?: string; wireframe?: string };
type Manual = {
  id: string;
  audience: Audience;
  category: string;
  title: string;
  summary: string;
  minutes: number;
  sections: Section[];
};

const audienceLabels: Record<Audience | 'all', string> = {
  all: 'All documentation',
  platform_admin: 'Platform administrators',
  owner: 'Business owners',
  staff: 'Staff and technicians',
};

const manuals: Manual[] = [
  {
    id: 'platform-admin-manual',
    audience: 'platform_admin',
    category: 'Infrastructure and control plane',
    title: 'Platform Administrator Guide',
    summary: 'Deploy, secure, operate, and support the complete ServicePro platform across Render, Cloudflare, and Supabase.',
    minutes: 35,
    sections: [
      {
        heading: 'Production architecture',
        body: 'Cloudflare serves the public web application and DNS, Render runs the Node API and workers, and Supabase PostgreSQL and Storage hold tenant data and public assets. Keep the API at api.aardvark-enterprises.net and the public application at aardvark-enterprises.net.',
        wireframe: '[ Browser / Tenant Storefront ]\n              |\n       [ Cloudflare DNS + SSL ]\n          |               |\n [ Static Web App ]   [ api.aardvark-enterprises.net ]\n                              |\n                    [ Render Node API / Workers ]\n                              |\n                   [ Supabase Postgres + Storage ]',
      },
      {
        heading: 'Render deployment',
        body: 'Create one Node web service for the API. Connect the production GitHub repository and main branch. Use the repository root, install production dependencies, start the API, and configure /readyz as the health check. Run migrations as a controlled release step before traffic reaches code that requires the new schema.',
        steps: [
          'Connect the repository and select main with automatic deploys after checks pass.',
          'Set build command to npm ci --omit=dev and start command to npm start.',
          'Set health check path to /readyz and confirm both /healthz and /readyz return success.',
          'Enter production environment variables; never commit database passwords or signing secrets.',
          'Open a Render shell or one-off job and run npm run migrate.',
          'Deploy the API and verify CORS, authentication, dashboard, storefront, and lead submission.',
          'For asynchronous notification processing, add a background worker using npm run notifications:process or the approved worker command and the same database/tenant configuration.',
        ],
        code: 'npm ci\nnpm run migrate\nnpm start\n\n# Release verification\ncurl https://api.aardvark-enterprises.net/readyz',
      },
      {
        heading: 'Cloudflare configuration',
        body: 'Use Full (strict) SSL/TLS, proxy public DNS records, and keep API responses out of broad caching rules. Cache hashed static assets aggressively; bypass cache for /api/*, authentication, and tenant-specific dynamic responses. The current storefront uses path routing (/p/?business=slug), so wildcard subdomains are optional.',
        steps: [
          'Point the apex and www hostnames to the deployed web application; redirect www to the apex.',
          'Point api to the Render service and keep HTTPS enforced.',
          'Set SSL/TLS mode to Full (strict), enable Always Use HTTPS, and maintain valid origin certificates.',
          'Create cache rules for immutable JS, CSS, fonts, and images; bypass /api/* and authenticated pages.',
          'If tenant subdomains are introduced, add a proxied wildcard DNS record and a Worker/route that maps the hostname to the tenant slug.',
        ],
      },
      {
        heading: 'Supabase database, pooling, RLS, and storage',
        body: 'Use the pooler connection string for the Render runtime and a direct or session-compatible connection for migrations when required. Keep RLS enabled on browser-accessible tables and enforce tenant_id membership in every policy. ServicePro API repositories also apply tenant scoping; both layers are intentional.',
        steps: [
          'Store DATABASE_URL only in Render secrets and set DATABASE_SSL=true.',
          'Run migrations in numeric order and confirm postgres_runtime_migrations after every release.',
          'Review RLS with pg_policies; policies must use is_tenant_member or has_tenant_role as appropriate.',
          'Create a private storefront-assets bucket with paths tenant-id/logo, tenant-id/hero, and tenant-id/services.',
          'Allow owners to write only their tenant prefix; public visitors may read only assets intentionally marked for published storefronts.',
          'Rotate exposed database credentials and JWT/portal secrets immediately.',
        ],
        code: "SELECT version FROM postgres_runtime_migrations ORDER BY version;\nSELECT schemaname, tablename, policyname, cmd FROM pg_policies ORDER BY tablename;\nSELECT tenant_id, branding->>'publicSlug', branding->>'publicPublished' FROM tenant_settings;",
      },
      {
        heading: 'Administrative operations',
        body: 'Only emails in PLATFORM_ADMIN_EMAILS receive the permanent platform control plane. Platform administrators create owner accounts, issue or extend timed owner access, assign one marketplace site type, enable tenant modules, manage global themes, and review audit activity. Platform administrators never require owner activation tokens.',
        steps: [
          'Open Platform Admin and provision the owner in the correct tenant.',
          'Assign the service-company marketplace/site pack.',
          'Select only purchased modules and save the tenant entitlement.',
          'Issue the one-time owner activation token with an expiry; extend, suspend, or revoke as support requires.',
          'Manage global storefront themes and validate changes against a preview tenant.',
          'Review audit logs, failed authentication events, access changes, and deployment health.',
        ],
        wireframe: '[ Platform Admin ]\n  +-- Owners: create / suspend / revoke / extend\n  +-- Modules: Operations / CRM / Assets / Billing / ...\n  +-- Marketplace: assign one service-company site pack\n  +-- Themes: publish approved global templates\n  +-- Audit: authentication, entitlement, and administration events',
      },
      {
        heading: 'Release and incident checklist',
        body: 'Back up before schema changes, deploy migrations before dependent code, keep rollback instructions with every release, and never troubleshoot by disabling tenant isolation or RLS.',
        steps: [
          'Confirm a current database backup and recovery point.',
          'Run tests and the production web build.',
          'Run npm run migrate once against the intended Supabase project.',
          'Deploy Render, then Cloudflare, and invalidate only affected cached assets.',
          'Smoke test login, platform admin, owner access, modules, work orders, customers, storefront, and lead capture.',
          'Record commit, migration range, operator, start/end time, and validation results.',
        ],
      },
      {
        heading: 'Documentation release lineage',
        body: 'Sprint 728 introduced the documentation portal. This role-based suite supersedes its general index while preserving searchable Guides, Tutorials, API reference, and Release notes.',
      },
    ],
  },
  {
    id: 'developer-integration-manual',
    audience: 'platform_admin',
    category: 'Engineering and integration',
    title: 'Web Developer & Technical Integration Guide',
    summary: 'Understand the repository, configure environments, extend modules and migrations, and add storefront themes safely.',
    minutes: 30,
    sections: [
      {
        heading: 'Codebase architecture',
        body: 'apps/api contains the Node router, route handlers, authorization middleware, domain services, and JSON/PostgreSQL repositories. apps/web contains the Next.js user interface. packages/database/postgres contains ordered migrations. Tests exercise tenant isolation and runtime behavior.',
        wireframe: '[ HTTP request ] -> requestContext -> authGuard -> ownerAccessGuard -> moduleAccessGuard\n                                                        |\n                                                    route handler\n                                                        |\n                                               repository factory\n                                                 /            \\\n                                           JSON store      PostgreSQL',
      },
      {
        heading: 'Authorization pipeline',
        body: 'Authentication and request format establish user, tenant, roles, and permissions. ownerAccessGuard enforces timed owner access but bypasses permanent platform administrators. moduleAccessGuard enforces platform tenant entitlements first and delegated employee module access second. Route permission checks enforce action-level RBAC.',
        steps: [
          'Never trust tenant IDs supplied in request bodies; use request context and operationalTenant helpers.',
          'Platform-admin checks must use the centralized allowlist service.',
          'Owners may delegate only modules already enabled for the tenant.',
          'Add tests proving cross-tenant reads and writes are rejected.',
        ],
        code: 'GET /api/v1/app-marketplace\nAuthorization: Bearer <access-token>\nX-Tenant-Id: <tenant-id>\nAccept: application/json',
      },
      {
        heading: 'Core environment-variable dictionary',
        body: 'Render owns server secrets; Cloudflare build settings own public frontend values. Public NEXT_PUBLIC values are embedded in browser bundles and must never contain secrets.',
        code: 'NODE_ENV=production                         # Runtime mode\nPORT=<assigned by Render>                   # API listener\nDATA_STORE=postgres                         # Production repository adapter\nDATABASE_URL=<Supabase pooler URI>           # Secret PostgreSQL connection\nDATABASE_SSL=true                           # Require TLS to Supabase\nDEFAULT_TENANT_ID=<tenant key or UUID>       # Default request tenant\nJWT_SECRET=<64+ random bytes>                # Access-token signing secret\nPORTAL_TOKEN_SECRET=<64+ random bytes>       # Portal-token signing secret\nPLATFORM_ADMIN_EMAILS=a@x.com,b@x.com        # Permanent platform administrators\nCORS_ALLOWED_ORIGINS=https://...,...         # Exact browser origins\nMAX_JSON_BODY_BYTES=1048576                  # Request body ceiling\nACCESS_TOKEN_TTL_SECONDS=<seconds>            # Login token duration\nREFRESH_TOKEN_TTL_SECONDS=<seconds>           # Refresh session duration\nPORTAL_TOKEN_TTL_SECONDS=<seconds>            # Customer portal duration\nRATE_LIMIT_WINDOW_MS=<milliseconds>           # General rate-limit window\nRATE_LIMIT_MAX_REQUESTS=<count>               # General rate-limit ceiling\nAUTH_RATE_LIMIT_MAX_REQUESTS=<count>          # Login rate-limit ceiling\nALLOW_PUBLIC_REGISTRATION=false               # Keep tenant signup controlled\nEXPOSE_AUTH_TOKENS=false                      # Never enable in production\nLOG_LEVEL=info                                # Runtime logging\nAPP_NAME=ServicePro                           # Service identity\nAPP_VERSION=<release commit/version>           # Health/release identity\nNEXT_PUBLIC_API_BASE_URL=https://api...        # Browser API origin\nNEXT_PUBLIC_DEFAULT_TENANT_ID=<tenant>         # Browser fallback tenant\nNEXT_OUTPUT=export                             # Static Cloudflare web build',
      },
      {
        heading: 'Adding a module entitlement',
        body: 'Define the canonical module key in the shared module catalog, map routes to it, expose it in platform administration, add owner delegation choices, and cover denial and success cases.',
        steps: [
          'Add one stable lowercase module key and display label.',
          'Map protected API paths in moduleAccessService/moduleAccessGuard.',
          'Add platform-admin entitlement toggles and owner team permission choices.',
          'Hide unavailable navigation for usability while retaining server enforcement.',
          'Test platform bypass, tenant-disabled denial, owner access, delegated staff access, and cross-tenant denial.',
        ],
      },
      {
        heading: 'Database migration rules',
        body: 'Add a new monotonically ordered SQL file under packages/database/postgres. Use idempotent guards where practical, preserve RLS policies when altering dependent columns, and record the version only after successful statements.',
        code: "BEGIN;\nCREATE TABLE IF NOT EXISTS example (...);\nALTER TABLE example ENABLE ROW LEVEL SECURITY;\n-- Add tenant-scoped policies and indexes.\nINSERT INTO postgres_runtime_migrations(version)\nVALUES ('NNN_description.sql') ON CONFLICT DO NOTHING;\nCOMMIT;",
      },
      {
        heading: 'Creating a public theme template',
        body: 'Add an approved theme definition with a stable slug and accessible color contrast. Keep layout components semantic, responsive, and compatible with owner-provided logos, hero images, service images, and text.',
        steps: [
          'Add theme name, slug, primary color, secondary color, and supported layout options.',
          'Preview short/long company names, missing images, one service, many services, and mobile layouts.',
          'Verify keyboard navigation, focus visibility, alt text, and WCAG contrast.',
          'Publish the theme for owner selection only after platform-admin review.',
        ],
      },
    ],
  },
  {
    id: 'business-owner-manual',
    audience: 'owner',
    category: 'Tenant administration',
    title: 'Business Owner Guide',
    summary: 'Activate access, configure the business workspace, manage staff permissions, publish the storefront, and process incoming leads.',
    minutes: 22,
    sections: [
      {
        heading: 'Set up your service workspace',
        body: 'Use the one-time activation link supplied by ServicePro. Create your password before the token expires. Your access lifetime is controlled by the platform team; contact support before expiry if an extension is required.',
        steps: ['Open the activation link once.', 'Confirm the intended business and email.', 'Create a unique password and sign in.', 'Review the enabled modules on Overview.', 'Do not share the activation link or owner credentials.'],
      },
      {
        heading: 'Understand entitlements',
        body: 'Platform administrators choose which modules your company purchased. You and your team can use only those enabled modules. Owners cannot enable marketplace packs, create other owners, or grant unavailable modules.',
        wireframe: '[ Platform modules enabled for company ]\n                    |\n                 [ Owner ]\n                    |\n       +------------+-------------+\n   [ Manager ] [ Technician ] [ Billing ]\n     only delegated enabled modules',
      },
      {
        heading: 'Manage the team',
        body: 'Open Team Management to create staff accounts and assign the least access needed. Available roles are admin, manager, technician, billing, and read-only.',
        steps: [
          'Select Add team member and enter the employee identity.',
          'Choose the role closest to the employee responsibilities.',
          'Check only required modules; unavailable platform modules cannot be granted.',
          'Provide the temporary password securely and require a change.',
          'Review access after transfers, departures, or responsibility changes.',
        ],
      },
      {
        heading: 'Build and publish the public storefront',
        body: 'Open Public Storefront, choose the public slug and approved theme, enter company branding, select visible services, and customize each automatically suggested service page.',
        steps: [
          'Choose a lowercase public slug such as plumber and confirm the preview URL.',
          'Add company headline, description, service area, hours, logo, and hero image.',
          'Select visible catalog services or add a new public service.',
          'Edit each suggested service title, marketing text, page headline, benefits, image, and starting price.',
          'Check Publish this storefront and click Save storefront.',
          'Open the preview and submit a test request before advertising the URL.',
        ],
        wireframe: '[ Storefront Builder ]\n  Business profile: slug | theme | publish\n  Branding: logo | hero | headline | service area\n  Services:\n    [x] Drain cleaning -> image + text + detail page\n    [x] Water heater  -> image + text + detail page\n  [ Save storefront ]   [ Preview ]',
      },
      {
        heading: 'Manage incoming leads',
        body: 'A public request creates a tenant-scoped prospective customer and open job. Review new requests promptly, verify contact and scope, schedule qualified staff, and document all follow-up.',
        steps: ['Open Work Orders and locate the new website request.', 'Review or merge the customer record.', 'Confirm service scope and priority.', 'Schedule and assign the work.', 'Send confirmation and maintain status through completion.'],
      },
    ],
  },
  {
    id: 'staff-technician-manual',
    audience: 'staff',
    category: 'Daily operations',
    title: 'Staff & Field Technician Guide',
    summary: 'Navigate permitted modules, work with customers and jobs, document field activity, and complete service workflows.',
    minutes: 18,
    sections: [
      {
        heading: 'Your workspace and permissions',
        body: 'Navigation reflects modules assigned by the owner. A missing or denied module means your role does not currently include it; ask the business owner rather than sharing another user account.',
      },
      {
        heading: 'Daily operating workflow',
        body: 'Start at Overview, review assigned and urgent work, check Schedule, then open each work order before travel or service.',
        steps: ['Review notifications and today’s schedule.', 'Open the assigned work order and confirm customer, address, scope, and priority.', 'Update status when traveling, on site, blocked, and completed.', 'Record notes, labor, materials, asset details, and customer approvals.', 'Verify follow-up work and close only when documentation is complete.'],
        wireframe: '[ Overview ] -> [ Schedule ] -> [ Work Order ]\n                                  | status / notes / materials\n                                  v\n                            [ Customer + Asset ]\n                                  |\n                            [ Complete / Invoice ]',
      },
      {
        heading: 'Create and dispatch your first work order',
        body: 'Search before creating a customer to prevent duplicates. Keep contact details and service locations accurate. Convert qualified requests into work orders and preserve the original request context in notes.',
        steps: ['Search by name, phone, email, and address.', 'Create or update the customer record.', 'Record the requested service and urgency.', 'Create the work order with the correct location and service.', 'Escalate safety, access, payment, or scheduling concerns.'],
      },
      {
        heading: 'Assets, inventory, and billing boundaries',
        body: 'If assigned, record serviced equipment, serial/model information, condition, photos, parts, and quantities. Billing users verify approved work and issue invoices; technicians should not alter financial records unless explicitly permitted.',
      },
      {
        heading: 'Security and field-use standards',
        body: 'Use only your account, protect customer information, avoid storing passwords in notes, and report unexpected access or suspicious messages. Sign out on shared devices and notify the owner immediately if a device is lost.',
      },
    ],
  },
];

function allowedAudiences(platformAdmin: boolean, roles: string[]) {
  if (platformAdmin) return new Set<Audience>(['platform_admin', 'owner', 'staff']);
  if (roles.includes('owner')) return new Set<Audience>(['owner', 'staff']);
  return new Set<Audience>(['staff']);
}

export function DocumentationWorkspace() {
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    Promise.all([
      authFetch('/auth/me').then((response) => response.ok ? response.json() : null),
      authFetch('/api/v1/access/modules').then((response) => response.ok ? response.json() : null),
    ]).then(([identity, access]) => {
      setRoles(identity?.data?.roles || []);
      setPlatformAdmin(Boolean(access?.data?.platformAdmin));
    }).catch(() => {
      setRoles([]);
      setPlatformAdmin(false);
    });
  }, []);

  const permitted = useMemo(() => allowedAudiences(platformAdmin, roles), [platformAdmin, roles]);
  const availableAudiences = useMemo(() => Object.keys(audienceLabels).filter((value) => value === 'all' || permitted.has(value as Audience)), [permitted]);
  const visible = useMemo(() => manuals.filter((manual) =>
    permitted.has(manual.audience)
    && (audience === 'all' || manual.audience === audience)
    && JSON.stringify(manual).toLowerCase().includes(query.toLowerCase())
  ), [audience, permitted, query]);
  const selected = visible.find((manual) => manual.id === selectedId) || visible[0];

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return <section className="docs-workspace">
    <div className="docs-hero"><div><span>Role-aware documentation center</span><h2>ServicePro full-suite operating manuals.</h2><p>Guides, Tutorials, API reference, and Release notes are displayed only when authorized for your platform or tenant role.</p></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documentation" /></label></div>
    <div className="docs-role-notice">Viewing documentation for <strong>{platformAdmin ? 'Platform administrator' : roles.includes('owner') ? 'Business owner' : 'Staff member'}</strong>. Restricted internal manuals are omitted.</div>
    <div className="docs-tabs">{availableAudiences.map((value) => <button key={value} className={audience === value ? 'active' : ''} onClick={() => setAudience(value as Audience | 'all')}>{audienceLabels[value as Audience | 'all']}</button>)}</div>
    <div className="docs-layout"><aside className="docs-index"><p>{visible.length} manuals</p>{visible.map((manual) => <button key={manual.id} className={selected?.id === manual.id ? 'active' : ''} onClick={() => setSelectedId(manual.id)}><span>{audienceLabels[manual.audience]}</span><strong>{manual.title}</strong><small>{manual.minutes} min · {manual.sections.length} chapters</small></button>)}</aside>
      <article className="docs-article">{selected ? <><header><span>{audienceLabels[selected.audience]} · {selected.category}</span><h2>{selected.title}</h2><p>{selected.summary}</p><small>{selected.minutes} minute read · {selected.sections.length} chapters</small></header>{selected.sections.map((section, index) => <section key={section.heading}><h3>{index + 1}. {section.heading}</h3><p>{section.body}</p>{section.steps && <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}{section.wireframe && <figure className="docs-wireframe"><figcaption>UI / architecture reference</figcaption><pre>{section.wireframe}</pre></figure>}{section.code && <div className="docs-code"><button onClick={() => void copy(section.code!, `${selected.id}-${index}`)}>{copied === `${selected.id}-${index}` ? 'Copied' : 'Copy'}</button><pre><code>{section.code}</code></pre></div>}</section>)}</> : <div className="docs-empty">No authorized manuals match this search.</div>}</article>
    </div>
  </section>;
}
