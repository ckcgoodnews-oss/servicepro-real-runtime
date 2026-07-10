const fs = require('fs');
const path = require('path');
const { createPostgresStore } = require('../apps/api/src/store/postgresStoreAdapter');

async function main() {
  const store = createPostgresStore();
  const migrationsDir = path.resolve('packages/database/postgres');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  await store.query(`
    CREATE TABLE IF NOT EXISTS postgres_runtime_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const applied = await store.query(
      'SELECT version FROM postgres_runtime_migrations WHERE version = $1',
      [file]
    );

    if (applied.rowCount > 0) {
      console.log(`Skipping already applied migration ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying migration ${file}`);
    await store.transaction(async tx => {
      await tx.query(sql);
      await tx.query(
        'INSERT INTO postgres_runtime_migrations (version) VALUES ($1)',
        [file]
      );
    });
  }

  await store.close();
  console.log('Migrations complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
