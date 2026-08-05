/**
 * tenantStore.js
 *
 * Wraps the shared postgres store and injects `options.tenantId` automatically
 * into every query() and transaction() call, ensuring the RLS context variable
 * `app.current_tenant` is set via SET LOCAL before any SQL executes.
 *
 * Usage:
 *   const { createTenantStore } = require('./tenantStore');
 *   const scopedStore = createTenantStore(store, req.context.tenantId);
 *   // Pass scopedStore to repository methods — all queries are tenant-scoped.
 */

function createTenantStore(store, tenantId) {
  if (!tenantId) throw new Error('tenantId is required to create a tenant-scoped store');

  // JSON store has no RLS — the application-layer WHERE clause is sufficient.
  if (store.type === 'json') return store;

  return {
    type: store.type,

    query(sql, params = []) {
      return store.query(sql, params, { tenantId });
    },

    transaction(callback) {
      return store.transaction(callback, { tenantId });
    },

    close() {
      return store.close();
    }
  };
}

module.exports = { createTenantStore };
