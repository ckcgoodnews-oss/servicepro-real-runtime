const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav'
];

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

module.exports = {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES
};
