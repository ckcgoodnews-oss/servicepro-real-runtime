const mode = process.env.DATA_STORE || 'json';

if (!['json', 'postgres'].includes(mode)) {
  console.error('DATA_STORE must be either json or postgres.');
  process.exit(1);
}

if (mode === 'postgres' && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required when DATA_STORE=postgres.');
  process.exit(1);
}

console.log(`Environment valid for DATA_STORE=${mode}.`);
