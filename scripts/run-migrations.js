const fs = require('fs');
const path = require('path');
const { createPostgresStore } = require('../apps/api/src/store/postgresStoreAdapter');

async function runMigrations(store, logger = console) {
  const migrationsDir = path.resolve('packages/database/postgres');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => /^\d{3}_.+\.sql$/.test(file))
    .sort();
  let appliedCount = 0;
  let skippedCount = 0;

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
      logger.log(`Skipping already applied migration ${file}`);
      skippedCount += 1;
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    logger.log(`Applying migration ${file}`);
    await store.transaction(async tx => {
      await tx.query(sql);
      await tx.query(
        'INSERT INTO postgres_runtime_migrations (version) VALUES ($1)',
        [file]
      );
    });
    appliedCount += 1;
  }

  return { total: files.length, applied: appliedCount, skipped: skippedCount, latest: files[files.length - 1] };
}

async function main() {
  const store = createPostgresStore();
  try {
    const result = await runMigrations(store);
    console.log(`Migrations complete. Applied ${result.applied}; skipped ${result.skipped}; latest ${result.latest}.`);
  } finally {
    await store.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runMigrations };
