const { Pool } = require('pg');

function createPostgresStore() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when DATA_STORE=postgres.');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    application_name: process.env.APP_NAME || 'ServicePro'
  });

  /**
   * Set the RLS tenant context for a client connection.
   * Uses SET LOCAL so the value is scoped to the current transaction
   * (and falls back to the session for non-transactional queries).
   * This must be called before any query on a checked-out client.
   */
  async function setTenantContext(client, tenantId) {
    if (!tenantId) return;
    // SET LOCAL is transaction-scoped; outside a transaction it acts as SET
    // for the duration of the single query round-trip on this client.
    await client.query('SELECT set_config($1, $2, true)', [
      'app.current_tenant',
      tenantId
    ]);
  }

  return {
    type: 'postgres',

    /**
     * Run a single query with optional RLS tenant context.
     * Pass options.tenantId to scope the query via SET LOCAL.
     */
    async query(sql, params = [], options = {}) {
      if (options.tenantId) {
        // Check out a client so SET LOCAL and the query share the same
        // connection (pool.query() may use different connections for each call).
        const client = await pool.connect();
        try {
          await setTenantContext(client, options.tenantId);
          const result = await client.query(sql, params);
          return { rows: result.rows, rowCount: result.rowCount };
        } finally {
          client.release();
        }
      }
      // No tenant context needed (migrations, platform-admin, health checks).
      const result = await pool.query(sql, params);
      return { rows: result.rows, rowCount: result.rowCount };
    },

    /**
     * Run multiple queries in a transaction with RLS tenant context.
     * The tenant context is set once at the start of the transaction and
     * applies to every query executed inside the callback.
     */
    async transaction(callback, options = {}) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        if (options.tenantId) {
          await setTenantContext(client, options.tenantId);
        }
        const tx = {
          type: 'postgres',
          async query(sql, params = []) {
            const result = await client.query(sql, params);
            return { rows: result.rows, rowCount: result.rowCount };
          }
        };
        const output = await callback(tx);
        await client.query('COMMIT');
        return output;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    async close() {
      await pool.end();
    }
  };
}

module.exports = { createPostgresStore };
