import { DatabaseClient } from './client';

export type Migration = {
  version: string;
  name: string;
  sql: string;
  checksum: string;
};

export interface MigrationSource {
  listMigrations(): Promise<Migration[]>;
}

export async function ensureMigrationTable(db: DatabaseClient): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function getAppliedMigrationVersions(db: DatabaseClient): Promise<Set<string>> {
  await ensureMigrationTable(db);
  const result = await db.query<{ version: string }>('SELECT version FROM schema_migrations');
  return new Set(result.rows.map(row => row.version));
}

export async function runPendingMigrations(db: DatabaseClient, source: MigrationSource): Promise<string[]> {
  await ensureMigrationTable(db);
  const applied = await getAppliedMigrationVersions(db);
  const migrations = await source.listMigrations();
  const appliedNow: string[] = [];

  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;

    await db.transaction(async tx => {
      await tx.query(migration.sql);
      await tx.query(
        'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
        [migration.version, migration.name, migration.checksum]
      );
    });

    appliedNow.push(migration.version);
  }

  return appliedNow;
}
