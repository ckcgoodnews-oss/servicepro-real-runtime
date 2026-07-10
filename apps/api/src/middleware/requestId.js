const crypto = require('crypto');

function attachRequestId(req, res) {
  const incoming = req.headers['x-request-id'];
  const requestId = incoming || crypto.randomUUID();

  if (!req.context) req.context = {};
  req.context.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  return requestId;
}

module.exports = { attachRequestId };
