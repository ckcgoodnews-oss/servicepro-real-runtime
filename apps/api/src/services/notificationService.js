// Notification service - Email (Resend) + SMS (Twilio)
const TWILIO_SID = process.env.TWILIO_SID || '';
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';

function emailConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM); }
function smsConfigured() { return Boolean(TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE); }

async function sendEmail({ to, subject, text, html, from }) {
  const fromAddr = from || process.env.EMAIL_FROM || '';

  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== 'production' && process.env.FEATURE_EMAIL_ENABLED !== 'true') {
      return { success: true, simulated: true, messageId: `sim_${Date.now()}` };
    }
    throw Object.assign(new Error('Email delivery is not configured.'), { code: 'email_not_configured', status: 503 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: Array.isArray(to) ? to : [to],
      from: fromAddr,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {})
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || `Email provider returned ${res.status}.`), { code: 'email_delivery_failed', status: 502 });
  return { success: true, statusCode: res.status, messageId: data.id || '' };
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
