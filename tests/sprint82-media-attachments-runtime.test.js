const fs = require('fs');

const required = [
  'apps/api/src/services/mediaService.js',
  'apps/api/src/repositories/mediaAttachmentRepository.js',
  'apps/api/src/routes/mediaAttachments.js',
  'packages/database/postgres/082_media_attachments_runtime.sql',
  'docs/sprint82-media-attachments-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 82 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  safeFilename,
  buildStorageKey,
  inferMediaKind,
  normalizeAttachmentInput,
  publicAttachmentMetadata
} = require('../apps/api/src/services/mediaService');

if (safeFilename('../bad file name!.jpg') !== 'bad-file-name-.jpg') {
  console.error('Filename sanitization failed.');
  process.exit(1);
}

if (inferMediaKind('image/png') !== 'image') {
  console.error('Media kind inference failed.');
  process.exit(1);
}

const attachment = normalizeAttachmentInput({
  entityType: 'job',
  entityId: 'job_demo_1',
  filename: 'before repair.png',
  mimeType: 'image/png',
  sizeBytes: 1234
}, 'tenant_demo');

if (!attachment.storageKey.includes('tenant_demo/job/job_demo_1') || attachment.mediaKind !== 'image') {
  console.error('Attachment normalization failed.');
  process.exit(1);
}

const publicView = publicAttachmentMetadata({ id: 'm1', tenantId: 'tenant_demo', ...attachment });
if (publicView.storageKey) {
  console.error('Public metadata leaked storageKey.');
  process.exit(1);
}

const key = buildStorageKey('tenant_demo', 'asset', 'asset_1', 'photo.jpg');
if (!key.includes('tenant_demo/asset/asset_1')) {
  console.error('Storage key builder failed.');
  process.exit(1);
}

console.log('Sprint 82 media attachments runtime patch test passed.');
