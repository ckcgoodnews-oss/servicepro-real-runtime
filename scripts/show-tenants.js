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
    "SELECT * FROM tenants LIMIT 10",
    "SELECT * FROM runtime_tenants LIMIT 10",
    "SELECT * FROM organizations LIMIT 10"
  ];

  for (const sql of queries) {
    try {
      console.log("\n==== " + sql + " ====");
      const result = await pool.query(sql);
      console.table(result.rows);
    } catch (e) {
      console.log("Skipped:", e.message);
    }
  }

  await pool.end();
})();