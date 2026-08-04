const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'apps/web/public');
const index = JSON.parse(fs.readFileSync(path.join(publicRoot, 'documentation/library/index.json'), 'utf8'));
const workspace = fs.readFileSync(path.join(root, 'apps/web/src/components/DocumentationWorkspace.tsx'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'apps/web/src/components/RepositoryDocumentationLibrary.tsx'), 'utf8');
const manualStyles = fs.readFileSync(path.join(root, 'apps/web/src/app/docs-manual-rich.css'), 'utf8');

assert.strictEqual(index.documentCount, 639);
assert.strictEqual(index.documents.length, 639);
assert.match(workspace, /Complete library/);
assert.match(workspace, /RepositoryDocumentationLibrary/);
assert.match(renderer, /Search all \{library\.documentCount\} documents/);
assert.match(renderer, /Markdown/);
assert.match(renderer, /Word/);
assert.match(renderer, /PDF/);
assert.match(workspace, /About this guide/);
assert.match(workspace, /After this guide, you can/);
assert.match(workspace, /Why this matters/);
assert.match(workspace, /Recommended procedure/);
assert.match(workspace, /href={`#\$\{selected\.id\}-chapter-\$\{index \+ 1\}`}/);
assert.match(workspace, /id={`\$\{selected\.id\}-chapter-\$\{index \+ 1\}`}/);
assert.match(workspace, /href="#documentation-manuals-top"/);
assert.match(workspace, /id="documentation-manuals-top"/);
assert.match(manualStyles, /\.docs-manual-overview/);
assert.match(manualStyles, /\.docs-chapter-nav/);
assert.match(manualStyles, /scroll-margin-top/);
assert.match(workspace, /function ManualDiagram/);
assert.match(workspace, /<ManualDiagram source={section\.wireframe}/);
assert.doesNotMatch(workspace, /<pre>{section\.wireframe}<\/pre>/);
assert.match(manualStyles, /\.docs-workflow-track/);
assert.match(manualStyles, /\.docs-workflow-card/);

for (const document of index.documents) {
  assert.ok(fs.existsSync(path.join(publicRoot, document.markdownUrl)));
  assert.ok(fs.existsSync(path.join(publicRoot, document.docxUrl)));
  assert.ok(fs.existsSync(path.join(publicRoot, document.pdfUrl)));
}

console.log('documentation library UI: 639 documents and download links ok');
