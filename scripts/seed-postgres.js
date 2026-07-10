const { createPostgresStore } = require('../apps/api/src/store/postgresStoreAdapter');

async function main() {
  const store = createPostgresStore();

  await store.query(`
    INSERT INTO customers (tenant_id, first_name, last_name, phone, email)
    SELECT 'tenant_demo', 'Maria', 'Johnson', '555-0101', 'maria@example.com'
    WHERE NOT EXISTS (
      SELECT 1 FROM customers WHERE tenant_id = 'tenant_demo' AND email = 'maria@example.com'
    )
  `);

  const customer = await store.query(
    `SELECT id FROM customers WHERE tenant_id = 'tenant_demo' AND email = 'maria@example.com' LIMIT 1`
  );

  if (customer.rows[0]) {
    await store.query(`
      INSERT INTO jobs (tenant_id, customer_id, title, status, priority)
      SELECT 'tenant_demo', $1, 'Kitchen sink clog', 'open', 'normal'
      WHERE NOT EXISTS (
        SELECT 1 FROM jobs WHERE tenant_id = 'tenant_demo' AND title = 'Kitchen sink clog'
      )
    `, [customer.rows[0].id]);
  }

  await store.close();
  console.log('PostgreSQL seed complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
