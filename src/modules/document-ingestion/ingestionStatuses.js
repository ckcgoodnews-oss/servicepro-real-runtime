const INGESTION_STATUSES = {
  QUEUED: 'queued',
  PARSING: 'parsing',
  CHUNKING: 'chunking',
  EMBEDDING: 'embedding',
  READY: 'ready',
  FAILED: 'failed'
};

module.exports = { INGESTION_STATUSES };
