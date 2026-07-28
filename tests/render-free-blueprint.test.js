const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('Render Blueprint is explicitly free and remains PostgreSQL-backed', () => {
  const blueprint = fs.readFileSync('render.yaml', 'utf8');
  const freePlans = blueprint.match(/^\s+plan:\s+free\s*$/gm) || [];

  assert.equal(freePlans.length, 3);
  assert.doesNotMatch(blueprint, /plan:\s+(starter|basic-256mb)/);
  assert.match(blueprint, /key:\s+DATA_STORE\s+value:\s+postgres/);
  assert.match(blueprint, /key:\s+DATABASE_URL\s+fromDatabase:/);
  assert.match(blueprint, /preDeployCommand:\s+npm run migrate/);
});
