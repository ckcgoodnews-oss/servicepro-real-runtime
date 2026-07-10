function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function documentHtml({ type, tenant, settings, customer, record, items }) {
  const title = type === 'estimate' ? `Estimate - ${record.title}` : `Invoice - ${record.invoice_number}`;
  const rows = items.map(i => `
    <tr>
      <td>${escapeHtml(i.description)}</td>
      <td style="text-align:right">${Number(i.quantity || 0)}</td>
      <td style="text-align:right">${money(i.unit_price)}</td>
      <td style="text-align:right">${money(i.total)}</td>
    </tr>`).join('');
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111827;margin:40px}.header{display:flex;justify-content:space-between;border-bottom:2px solid #111827;padding-bottom:18px;margin-bottom:24px}.muted{color:#6b7280}.box{border:1px solid #d1d5db;border-radius:8px;padding:14px;margin:12px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}th{background:#f9fafb}.totals{max-width:320px;margin-left:auto}.print{margin:20px 0}@media print{.print{display:none}body{margin:20px}}
  </style>
</head>
<body>
  <button class="print" onclick="window.print()">Print / Save as PDF</button>
  <div class="header">
    <div>
      <h1>${escapeHtml(settings?.business_name || tenant?.name || 'ServicePro')}</h1>
      <div class="muted">${escapeHtml(settings?.address || '')} ${escapeHtml(settings?.city || '')} ${escapeHtml(settings?.state || '')} ${escapeHtml(settings?.zip || '')}</div>
      <div class="muted">${escapeHtml(settings?.phone || '')} ${escapeHtml(settings?.email || '')}</div>
    </div>
    <div>
      <h2>${type === 'estimate' ? 'Estimate' : 'Invoice'}</h2>
      <div class="muted">Status: ${escapeHtml(record.status)}</div>
      ${record.invoice_number ? `<div class="muted"># ${escapeHtml(record.invoice_number)}</div>` : ''}
    </div>
  </div>
  <div class="box">
    <strong>Customer</strong><br>
    ${escapeHtml((customer?.first_name || '') + ' ' + (customer?.last_name || ''))}<br>
    ${escapeHtml(customer?.phone || '')}<br>
    ${escapeHtml(customer?.email || '')}<br>
    ${escapeHtml(customer?.address || '')} ${escapeHtml(customer?.city || '')} ${escapeHtml(customer?.state || '')} ${escapeHtml(customer?.zip || '')}
  </div>
  <h3>${escapeHtml(record.title || '')}</h3>
  <p>${escapeHtml(record.description || '')}</p>
  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals box">
    <div>Subtotal: <strong>${money(record.subtotal)}</strong></div>
    <div>Tax: <strong>${money(record.tax)}</strong></div>
    <div>Total: <strong>${money(record.total)}</strong></div>
    ${type === 'invoice' ? `<div>Paid: <strong>${money(record.amount_paid)}</strong></div><div>Balance: <strong>${money(Number(record.total || 0) - Number(record.amount_paid || 0))}</strong></div>` : ''}
  </div>
</body>
</html>`;
}

module.exports = { documentHtml };
