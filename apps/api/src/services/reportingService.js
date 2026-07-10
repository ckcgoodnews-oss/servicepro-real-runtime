function sum(items, selector) {
  return Math.round(items.reduce((total, item) => total + Number(selector(item) || 0), 0) * 100) / 100;
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildDashboardSnapshot(data, tenantId) {
  const customers = (data.customers || []).filter(x => x.tenantId === tenantId);
  const jobs = (data.jobs || []).filter(x => x.tenantId === tenantId);
  const estimates = (data.estimates || []).filter(x => x.tenantId === tenantId);
  const invoices = (data.invoices || []).filter(x => x.tenantId === tenantId);
  const payments = (data.payments || []).filter(x => x.tenantId === tenantId);
  const materials = (data.materialUsage || []).filter(x => x.tenantId === tenantId);
  const appointments = (data.appointments || []).filter(x => x.tenantId === tenantId);
  const bookings = (data.portalBookings || []).filter(x => x.tenantId === tenantId);

  return {
    customers: { total: customers.length },
    jobs: { total: jobs.length, byStatus: countBy(jobs, x => x.status), byPriority: countBy(jobs, x => x.priority) },
    revenue: {
      estimateTotal: sum(estimates, x => x.total),
      invoiceTotal: sum(invoices, x => x.total),
      paidTotal: sum(payments, x => x.amount),
      balanceDue: sum(invoices, x => x.balanceDue)
    },
    operations: {
      appointments: appointments.length,
      portalBookings: bookings.length,
      materialCost: sum(materials, x => Number(x.quantity || 0) * Number(x.unitCost || 0))
    }
  };
}

function buildReportCatalog() {
  return [
    { key: 'dashboard', name: 'Dashboard Summary', category: 'operations' },
    { key: 'revenue', name: 'Revenue Summary', category: 'financial' },
    { key: 'jobs-by-status', name: 'Jobs by Status', category: 'operations' },
    { key: 'inventory-value', name: 'Inventory Value', category: 'inventory' },
    { key: 'portal-bookings', name: 'Portal Bookings', category: 'customer_portal' }
  ];
}

module.exports = { sum, countBy, buildDashboardSnapshot, buildReportCatalog };
