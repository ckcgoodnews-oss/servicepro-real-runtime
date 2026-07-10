const { parseJsonText } = require('./safeJson');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  sendJson(res, 404, { error: { code: 'not_found', message: 'Route not found' } });
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return parseJsonText(raw);
}

module.exports = { sendJson, notFound, parseJsonBody };
