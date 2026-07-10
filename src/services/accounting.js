const { byTenant } = require('../db/store');

function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

function dollars(value) {
  return (Number(value || 0) / 100).toFixed(2);
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map(h => csvEscape(row[h])).join(','));
  return lines.join('\n');
}

function invoiceTotals(tenantId) {
  const invoices = byTenant('invoices', tenantId);
  const items = byTenant('invoiceItems', tenantId);
  return invoices.map(inv => {
    const invItems = items.filter(i => i.invoiceId === inv.id);
    const subtotalCents = invItems.reduce((sum, item) => sum + cents(item.quantity) * cents(item.unitPrice) / 100, 0);
    const taxCents = Math.round(subtotalCents * Number(inv.taxRate || 0));
    const totalCents = subtotalCents + taxCents;
    return { ...inv, subtotalCents, taxCents, totalCents };
  });
}

function customerBalances(tenantId) {
  const customers = byTenant('customers', tenantId);
  const invoices = invoiceTotals(tenantId);
  const payments = byTenant('payments', tenantId);
  return customers.map(customer => {
    const customerInvoices = invoices.filter(i => i.customerId === customer.id);
    const invoiceCents = customerInvoices.reduce((sum, i) => sum + i.totalCents, 0);
    const paymentCents = payments.filter(p => p.customerId === customer.id).reduce((sum, p) => sum + cents(p.amount), 0);
    return {
      customer,
      invoiceTotal: dollars(invoiceCents),
      paymentTotal: dollars(paymentCents),
      balance: dollars(invoiceCents - paymentCents)
    };
  });
}

function invoicesCsv(tenantId) {
  const rows = invoiceTotals(tenantId).map(i => ({
    invoice_id: i.id,
    customer_id: i.customerId,
    status: i.status,
    subtotal: dollars(i.subtotalCents),
    tax: dollars(i.taxCents),
    total: dollars(i.totalCents),
    created_at: i.createdAt
  }));
  return toCsv(['invoice_id','customer_id','status','subtotal','tax','total','created_at'], rows);
}

function paymentsCsv(tenantId) {
  const rows = byTenant('payments', tenantId).map(p => ({
    payment_id: p.id,
    customer_id: p.customerId,
    invoice_id: p.invoiceId || '',
    method: p.method,
    amount: Number(p.amount || 0).toFixed(2),
    received_at: p.receivedAt || p.createdAt
  }));
  return toCsv(['payment_id','customer_id','invoice_id','method','amount','received_at'], rows);
}

module.exports = { invoiceTotals, customerBalances, invoicesCsv, paymentsCsv };
