export type DatabaseConfig = {
  databaseUrl: string;
  ssl?: boolean;
  applicationName?: string;
};

export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  transaction<T>(callback: (tx: DatabaseClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export function createDatabaseConfigFromEnv(env: NodeJS.ProcessEnv): DatabaseConfig {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  return {
    databaseUrl: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === 'true',
    applicationName: env.APP_NAME || 'ServicePro'
  };
}
