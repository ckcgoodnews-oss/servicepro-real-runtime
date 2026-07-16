const assert = require('assert');
const { validateOnlineAlpha } = require('../scripts/validate-online-alpha');

const result = validateOnlineAlpha();
assert.deepStrictEqual(result, { services: 2, branchPinned: true, autoDeploy: false });
console.log('Sprint 731 online alpha deployment test passed.');
