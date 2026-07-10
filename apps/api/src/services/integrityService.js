function findDuplicateKeys(rows, keySelector) {
  const seen = new Set();
  const duplicates = [];
  for (const row of rows || []) {
    const key = keySelector(row);
    if (!key) continue;
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }
  return Array.from(new Set(duplicates));
}

function runJsonIntegrityChecks(data, tenantId) {
  const customers = (data.customers || []).filter(x => x.tenantId === tenantId);
  const jobs = (data.jobs || []).filter(x => x.tenantId === tenantId);
  const invoices = (data.invoices || []).filter(x => x.tenantId === tenantId);
  const inventoryItems = (data.inventoryItems || []).filter(x => x.tenantId === tenantId);

  const customerIds = new Set(customers.map(c => c.id));
  const jobIds = new Set(jobs.map(j => j.id));

  const issues = [];

  for (const job of jobs) {
    if (job.customerId && !customerIds.has(job.customerId)) {
      issues.push({ code: 'job_missing_customer', entityType: 'job', entityId: job.id, message: `Job references missing customer ${job.customerId}` });
    }
  }

  for (const invoice of invoices) {
    if (invoice.customerId && !customerIds.has(invoice.customerId)) {
      issues.push({ code: 'invoice_missing_customer', entityType: 'invoice', entityId: invoice.id, message: `Invoice references missing customer ${invoice.customerId}` });
    }
    if (invoice.jobId && !jobIds.has(invoice.jobId)) {
      issues.push({ code: 'invoice_missing_job', entityType: 'invoice', entityId: invoice.id, message: `Invoice references missing job ${invoice.jobId}` });
    }
    if (Number(invoice.balanceDue || 0) < 0) {
      issues.push({ code: 'negative_balance_due', entityType: 'invoice', entityId: invoice.id, message: 'Invoice balance due cannot be negative' });
    }
  }

  for (const item of inventoryItems) {
    if (Number(item.quantityOnHand || 0) < 0) {
      issues.push({ code: 'negative_inventory', entityType: 'inventory', entityId: item.id, message: 'Inventory quantity cannot be negative' });
    }
  }

  for (const sku of findDuplicateKeys(inventoryItems, x => x.sku)) {
    issues.push({ code: 'duplicate_sku', entityType: 'inventory', entityId: sku, message: `Duplicate inventory SKU ${sku}` });
  }

  return {
    status: issues.length ? 'failed' : 'passed',
    issueCount: issues.length,
    issues
  };
}

module.exports = { findDuplicateKeys, runJsonIntegrityChecks };
