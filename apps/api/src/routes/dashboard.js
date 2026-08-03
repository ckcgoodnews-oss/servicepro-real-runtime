const { sendJson } = require('../utils/http');
const {
  resolveOperationalTenantId
} = require('../services/tenantResolver');

function sameDay(value, today = new Date()) {
  const date = new Date(value);

  return (
    !Number.isNaN(date.valueOf()) &&
    date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
  );
}

function humanizeSlug(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function formatDashboardActivity(row) {
  const raw = String(row.action || row.eventType || '').trim();
  const request = raw.match(/^(GET|POST|PUT|PATCH|DELETE)\s+([^?\s]+)/i);
  if (!request) {
    return {
      displayTitle: humanizeSlug(raw) || 'System activity',
      displayContext: humanizeSlug(row.entityType) || 'ServicePro'
    };
  }

  const method = request[1].toUpperCase();
  const path = request[2];
  const storefront = path.match(/^\/api\/public\/storefront\/([^/]+)$/i);
  const blog = path.match(/^\/api\/public\/blog\/([^/]+)$/i);

  if (storefront) return { displayTitle: 'Public storefront viewed', displayContext: humanizeSlug(storefront[1]) };
  if (blog) return { displayTitle: 'Public blog viewed', displayContext: humanizeSlug(blog[1]) };
  if (path === '/') return { displayTitle: 'Website homepage viewed', displayContext: 'Public website' };
  if (/\/auth\/login$/i.test(path)) return { displayTitle: method === 'POST' ? 'User signed in' : 'Sign-in page viewed', displayContext: 'Authentication' };
  if (method === 'GET') return { displayTitle: 'Application page viewed', displayContext: humanizeSlug(path.split('/').filter(Boolean).pop() || 'ServicePro') };
  return { displayTitle: 'Application data updated', displayContext: humanizeSlug(path.split('/').filter(Boolean).pop() || 'ServicePro') };
}

async function summary(req, res) {
  const repositories = req.context.repositories;

  /*
   * Authentication uses the tenant key, such as "tenant_demo".
   * Operational PostgreSQL tables use the tenants.id UUID.
   */
  let tenantId;
  try {
    tenantId = await resolveOperationalTenantId(
      repositories.store,
      req.context.operationalTenantId || req.context.tenantId
    );
  } catch {
    // Tenant not yet in the tenants table — use the raw key
    tenantId = req.context.tenantId;
  }

  let jobs = [], appointments = [], customers = [], invoices = [], notifications = [], activity = [];
  try {
    [jobs, appointments, customers, invoices, notifications, activity] = await Promise.all([
      repositories.jobs.list(tenantId),
      repositories.appointments.list(tenantId),
      repositories.customers.list(tenantId),
      repositories.invoices.list(tenantId),
      repositories.notifications.list(tenantId),
      repositories.audit.list(tenantId, 8)
    ]);
  } catch (err) {
    console.error('[dashboard.summary] Data fetch error:', err?.message || err);
    // Return empty dashboard for tenants without data tables
  }

  const customerNames = new Map(
    customers.map(row => [
      row.id,
      `${row.firstName || ''} ${row.lastName || ''}`.trim()
    ])
  );

  const openJobs = jobs.filter(
    row =>
      !['completed', 'cancelled', 'closed'].includes(
        String(row.status).toLowerCase()
      )
  );

  const priorityRank = {
    urgent: 0,
    high: 1,
    normal: 2,
    low: 3
  };

  const attention = openJobs
    .slice()
    .sort(
      (a, b) =>
        (priorityRank[a.priority] ?? 9) -
        (priorityRank[b.priority] ?? 9)
    )
    .slice(0, 5)
    .map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      customer: customerNames.get(row.customerId) || 'Unassigned customer',
      updatedAt: row.updatedAt
    }));

  const recentWork = jobs
    .slice()
    .sort(
      (a, b) =>
        Date.parse(b.updatedAt || b.createdAt) -
        Date.parse(a.updatedAt || a.createdAt)
    )
    .slice(0, 5)
    .map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      customer: customerNames.get(row.customerId) || 'Unassigned customer',
      updatedAt: row.updatedAt || row.createdAt
    }));

  return sendJson(res, 200, {
    data: {
      generatedAt: new Date().toISOString(),
      kpis: {
        openWork: openJobs.length,
        appointmentsToday: appointments.filter(row => sameDay(row.startTime)).length,
        customers: customers.length,
        outstanding: invoices.reduce(
          (sum, row) => sum + Number(row.balanceDue || 0),
          0
        )
      },
      attention,
      recentWork,
      notifications: notifications.slice(0, 5).map(row => ({
        id: row.id,
        subject: row.subject || row.templateKey || 'Notification',
        status: row.status,
        createdAt: row.createdAt
      })),
      activity: activity.slice(0, 5).map(row => ({
        id: row.id,
        eventType: row.eventType,
        action: row.action,
        entityType: row.entityType,
        createdAt: row.createdAt,
        ...formatDashboardActivity(row)
      }))
    }
  });
}

module.exports = {
  summary,
  sameDay,
  formatDashboardActivity
};
