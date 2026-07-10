const http = require('http');

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: Number(process.env.PORT || 3000),
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN || 'dev-token-change-me'}`,
        'x-tenant-id': process.env.DEFAULT_TENANT_ID || 'tenant_demo'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  console.log(await request('/healthz'));
  console.log(await request('/api/v1/customers'));
  console.log(await request('/api/v1/jobs'));
})();
