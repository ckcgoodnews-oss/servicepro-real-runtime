const assert = require('assert');

process.env.NODE_ENV = 'production';
process.env.FEATURE_EMAIL_ENABLED = 'true';
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;

const { emailConfigured, sendEmail } = require('../apps/api/src/services/notificationService');

assert.strictEqual(emailConfigured(), false);
assert.rejects(
  () => sendEmail({ to: 'owner@example.com', subject: 'Test', text: 'Test' }),
  error => error.code === 'email_not_configured' && error.status === 503
).then(async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.EMAIL_FROM = 'ServicePRO <noreply@example.com>';
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({ id: 'email_123' }) };
  };
  try {
    const result = await sendEmail({ to: 'owner@example.com', subject: 'Welcome', text: 'Hello' });
    assert.strictEqual(result.messageId, 'email_123');
    assert.strictEqual(request.url, 'https://api.resend.com/emails');
    assert.strictEqual(request.options.headers.Authorization, 'Bearer re_test');
    const body = JSON.parse(request.options.body);
    assert.deepStrictEqual(body.to, ['owner@example.com']);
    assert.strictEqual(body.from, process.env.EMAIL_FROM);
  } finally {
    global.fetch = originalFetch;
  }
  console.log('Production email delivery test passed.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
