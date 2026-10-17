const test = require('node:test');
const assert = require('node:assert/strict');
const { createTrialRepository } = require('../apps/api/src/repositories/trialRepository');

test('Postgres trial repository uses the public store query contract', async () => {
  const calls = [];
  const store = {
    type: 'postgres',
    async query(sql, params) {
      calls.push({ sql, params });
      return { rows: [] };
    }
  };

  const repository = createTrialRepository(store);
  assert.equal(await repository.findByEmail('test@example.com'), null);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /FROM trials WHERE email/);
  assert.deepEqual(calls[0].params, ['test@example.com']);
});
