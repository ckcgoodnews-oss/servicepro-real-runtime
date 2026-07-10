function renderTemplate(template, data = {}) {
  return String(template || '').replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_, key) => {
    const value = key.split('.').reduce((current, part) => {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) return current[part];
      return undefined;
    }, data);

    return value === undefined || value === null ? '' : String(value);
  });
}

function buildNotificationFromTemplate(template, recipient, data = {}) {
  return {
    channel: template.channel,
    toAddress: recipient.toAddress,
    toName: recipient.toName || '',
    subject: renderTemplate(template.subject || '', data),
    body: renderTemplate(template.body || '', data),
    templateKey: template.templateKey
  };
}

module.exports = { renderTemplate, buildNotificationFromTemplate };
