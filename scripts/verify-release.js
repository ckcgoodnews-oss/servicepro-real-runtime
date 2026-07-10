const fs = require('fs');
const path = require('path');

const checks = [
  { key: 'package_json_exists', ok: fs.existsSync(path.resolve('package.json')) },
  { key: 'readme_exists', ok: fs.existsSync(path.resolve('README.md')) },
  { key: 'env_example_exists', ok: fs.existsSync(path.resolve('.env.example')) },
  { key: 'docs_exist', ok: fs.existsSync(path.resolve('docs')) },
  { key: 'tests_exist', ok: fs.existsSync(path.resolve('tests')) }
];

const failed = checks.filter(c => !c.ok);

const report = {
  generatedAt: new Date().toISOString(),
  release: 'servicepro-real-sprint28',
  checks,
  passed: failed.length === 0
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/release-verification.json', JSON.stringify(report, null, 2));

if (failed.length) {
  console.error('Release verification failed:', failed);
  process.exit(1);
}

console.log('Release verification passed. Report written to reports/release-verification.json');
