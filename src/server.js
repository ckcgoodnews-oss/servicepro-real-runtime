require('dotenv').config();

const http = require('http');

const port = Number(process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'servicepro', sprint: 27 }));
    return;
  }

  if (req.url === '/readyz') {
    const ready = Boolean(process.env.DATABASE_URL);
    res.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ready }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<h1>ServicePro Sprint 27</h1><p>Production operations foundation is installed.</p>');
});

server.listen(port, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'ServicePro started',
    port,
    environment: process.env.NODE_ENV || 'development'
  }));
});
