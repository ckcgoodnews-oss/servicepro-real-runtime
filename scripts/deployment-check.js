const http = require('http');

const port = Number(process.env.PORT || 3000);
const host = process.env.DEPLOYMENT_CHECK_HOST || '127.0.0.1';

function check(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host, port, path, method: 'GET', timeout: 3000 }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ statusCode: res.statusCode, body });
        else reject(new Error(`${path} returned ${res.statusCode}`));
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`${path} timed out`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const health = await check('/healthz');
  const ready = await check('/readyz');
  console.log(JSON.stringify({ ok: true, health: health.statusCode, ready: ready.statusCode }));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
