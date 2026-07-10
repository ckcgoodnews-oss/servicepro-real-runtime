import { DatabaseClient } from './client';

export type SeedContext = {
  tenantId?: string;
  environment: 'development' | 'test' | 'staging' | 'production';
};

export type SeedTask = {
  key: string;
  description: string;
  run(db: DatabaseClient, context: SeedContext): Promise<void>;
};

export async function runSeeds(db: DatabaseClient, tasks: SeedTask[], context: SeedContext): Promise<string[]> {
  const completed: string[] = [];

  for (const task of tasks) {
    await task.run(db, context);
    completed.push(task.key);
  }

  return completed;
}
