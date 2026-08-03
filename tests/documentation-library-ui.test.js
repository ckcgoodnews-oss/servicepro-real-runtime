const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'apps/web/public');
const index = JSON.parse(fs.readFileSync(path.join(publicRoot, 'documentation/library/index.json'), 'utf8'));
const workspace = fs.readFileSync(path.join(root, 'apps/web/src/components/DocumentationWorkspace.tsx'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'apps/web/src/components/RepositoryDocumentationLibrary.tsx'), 'utf8');

assert.strictEqual(index.documentCount, 639);
assert.strictEqual(index.documents.length, 639);
assert.match(workspace, /Complete library/);
assert.match(workspace, /RepositoryDocumentationLibrary/);
assert.match(renderer, /Search all \{library\.documentCount\} documents/);
assert.match(renderer, /Markdown/);
assert.match(renderer, /Word/);
assert.match(renderer, /PDF/);

for (const document of index.documents) {
  assert.ok(fs.existsSync(path.join(publicRoot, document.markdownUrl)));
  assert.ok(fs.existsSync(path.join(publicRoot, document.docxUrl)));
  assert.ok(fs.existsSync(path.join(publicRoot, document.pdfUrl)));
}

console.log('documentation library UI: 639 documents and download links ok');
