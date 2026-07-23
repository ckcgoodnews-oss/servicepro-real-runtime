require('dotenv').config();

const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false
  });

  const queries = [
    `
      SELECT DISTINCT tenant_id
      FROM runtime_users
      ORDER BY tenant_id
    `,
    `
      SELECT DISTINCT tenant_id
      FROM runtime_auth_sessions
      ORDER BY tenant_id
    `,
    `
      SELECT DISTINCT tenant_id::text
      FROM jobs
      ORDER BY tenant_id::text
    `
  ];

  for (const sql of queries) {
    try {
      const result = await pool.query(sql);
      console.log('\n' + sql.trim());
      console.table(result.rows);
    } catch (error) {
      console.log('\nSkipped:', error.message);
    }
  }

  await pool.end();
})().catch(error => {
  console.error(error);
  process.exit(1);
});