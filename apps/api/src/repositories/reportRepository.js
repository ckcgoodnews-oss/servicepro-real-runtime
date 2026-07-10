const { buildDashboardSnapshot, buildReportCatalog, sum, countBy } = require('../services/reportingService');

function createReportRepository(store) {
  if (store.type === 'json') return createJsonReportRepository(store);
  if (store.type === 'postgres') return createPostgresReportRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonReportRepository(store) {
  return {
    catalog() {
      return buildReportCatalog();
    },
    dashboard(tenantId) {
      return buildDashboardSnapshot(store.read(), tenantId);
    },
    revenue(tenantId) {
      const data = store.read();
      const invoices = (data.invoices || []).filter(x => x.tenantId === tenantId);
      const payments = (data.payments || []).filter(x => x.tenantId === tenantId);
      return {
        invoiceCount: invoices.length,
        invoiceTotal: sum(invoices, x => x.total),
        paidTotal: sum(payments, x => x.amount),
        balanceDue: sum(invoices, x => x.balanceDue),
        invoicesByStatus: countBy(invoices, x => x.status)
      };
    },
    jobsByStatus(tenantId) {
      return countBy((store.read().jobs || []).filter(x => x.tenantId === tenantId), x => x.status);
    },
    inventoryValue(tenantId) {
      const items = (store.read().inventoryItems || []).filter(x => x.tenantId === tenantId && x.active !== false);
      return {
        itemCount: items.length,
        costValue: sum(items, x => Number(x.quantityOnHand || 0) * Number(x.unitCost || 0)),
        retailValue: sum(items, x => Number(x.quantityOnHand || 0) * Number(x.unitPrice || 0)),
        lowStockItems: items.filter(x => Number(x.quantityOnHand || 0) <= Number(x.reorderPoint || 0))
      };
    },
    portalBookings(tenantId) {
      const bookings = (store.read().portalBookings || []).filter(x => x.tenantId === tenantId);
      return { total: bookings.length, byStatus: countBy(bookings, x => x.status), rows: bookings };
    }
  };
}

function createPostgresReportRepository(store) {
  return {
    catalog() {
      return buildReportCatalog();
    },
    async dashboard(tenantId) {
      const result = await store.query('SELECT * FROM reporting_dashboard_summary WHERE tenant_id = $1', [tenantId]);
      return result.rows[0] || {};
    },
    async revenue(tenantId) {
      const result = await store.query('SELECT * FROM reporting_revenue_summary WHERE tenant_id = $1', [tenantId]);
      return result.rows[0] || {};
    },
    async jobsByStatus(tenantId) {
      const result = await store.query('SELECT status, count(*)::int as count FROM jobs WHERE tenant_id = $1 GROUP BY status ORDER BY status', [tenantId]);
      return result.rows.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {});
    },
    async inventoryValue(tenantId) {
      const result = await store.query(
        `SELECT count(*)::int as "itemCount",
                COALESCE(sum(quantity_on_hand * unit_cost), 0)::float as "costValue",
                COALESCE(sum(quantity_on_hand * unit_price), 0)::float as "retailValue"
         FROM inventory_items WHERE tenant_id = $1 AND active = true`,
        [tenantId]
      );
      const lowStock = await store.query(
        `SELECT id::text, sku, name, quantity_on_hand::float as "quantityOnHand", reorder_point::float as "reorderPoint"
         FROM inventory_items WHERE tenant_id = $1 AND active = true AND quantity_on_hand <= reorder_point ORDER BY name`,
        [tenantId]
      );
      return { ...result.rows[0], lowStockItems: lowStock.rows };
    },
    async portalBookings(tenantId) {
      const counts = await store.query('SELECT status, count(*)::int as count FROM portal_booking_requests WHERE tenant_id = $1 GROUP BY status', [tenantId]);
      const rows = await store.query(
        `SELECT id::text, customer_id::text as "customerId", service_type as "serviceType",
                requested_date as "requestedDate", status, created_at as "createdAt"
         FROM portal_booking_requests WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
      return { total: rows.rowCount, byStatus: counts.rows.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {}), rows: rows.rows };
    }
  };
}

module.exports = { createReportRepository };
