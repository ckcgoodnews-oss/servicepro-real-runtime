// Notification service - Email (SendGrid) + SMS (Twilio)
// Uses environment variables: SENDGRID_KEY, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE

const SENDGRID_KEY = process.env.SENDGRID_KEY || '';
const TWILIO_SID = process.env.TWILIO_SID || '';
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';

function emailConfigured() { return Boolean(SENDGRID_KEY); }
function smsConfigured() { return Boolean(TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE); }

async function sendEmail({ to, subject, text, html, from }) {
  const fromAddr = from || process.env.EMAIL_FROM || 'noreply@servicepro.app';

  if (!emailConfigured()) {
    console.log(`[email-sim] To: ${to}, Subject: ${subject}`);
    return { success: true, simulated: true, messageId: `sim_${Date.now()}` };
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SENDGRID_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromAddr },
      subject,
      content: [
        ...(text ? [{ type: 'text/plain', value: text }] : []),
        ...(html ? [{ type: 'text/html', value: html }] : [])
      ]
    })
  });

  return { success: res.status === 202, statusCode: res.status, messageId: res.headers.get('x-message-id') || '' };
}

async function sendSms({ to, body }) {
  if (!smsConfigured()) {
    console.log(`[sms-sim] To: ${to}, Body: ${body}`);
    return { success: true, simulated: true, sid: `sim_${Date.now()}` };
  }

  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: TWILIO_PHONE, To: to, Body: body })
  });

  const data = await res.json();
  return { success: !data.code, sid: data.sid || '', error: data.message || '' };
}

// Templated notification dispatch
async function notify(channel, recipient, template, vars = {}) {
  let subject = template.subject || '';
  let body = template.body || '';

  for (const [key, value] of Object.entries(vars)) {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }

  if (channel === 'email') {
    return sendEmail({ to: recipient, subject, html: body });
  }
  if (channel === 'sms') {
    return sendSms({ to: recipient, body: `${subject}: ${body}`.slice(0, 160) });
  }
  return { success: false, error: `Unknown channel: ${channel}` };
}

module.exports = { emailConfigured, smsConfigured, sendEmail, sendSms, notify };
