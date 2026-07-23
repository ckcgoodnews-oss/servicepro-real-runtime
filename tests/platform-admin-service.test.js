const assert = require('node:assert/strict');
const test = require('node:test');
const {isPlatformAdmin, platformAdminEmails} = require('../apps/api/src/services/platformAdminService');

test('recognizes the application owner administrators without environment configuration', () => {
  const previous = process.env.PLATFORM_ADMIN_EMAILS;
  delete process.env.PLATFORM_ADMIN_EMAILS;
  try {
    assert.equal(isPlatformAdmin({context: {email: '5189213@gmail.com'}}), true);
    assert.equal(isPlatformAdmin({context: {email: 'someone@example.com'}}), false);
  } finally {
    if (previous === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = previous;
  }
});

test('normalizes quoted and accidentally prefixed Render values', () => {
  const previous = process.env.PLATFORM_ADMIN_EMAILS;
  process.env.PLATFORM_ADMIN_EMAILS = 'PLATFORM_ADMIN_EMAILS="Extra.Admin@Example.com"';
  try {
    assert.ok(platformAdminEmails().includes('extra.admin@example.com'));
  } finally {
    if (previous === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = previous;
  }
});
