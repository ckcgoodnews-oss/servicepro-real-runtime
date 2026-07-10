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

  return {
    type: 'postgres',
    async query(sql, params = []) {
      const result = await pool.query(sql, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount
      };
    },
    async transaction(callback) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const tx = {
          type: 'postgres',
          async query(sql, params = []) {
            const result = await client.query(sql, params);
            return {
              rows: result.rows,
              rowCount: result.rowCount
            };
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
