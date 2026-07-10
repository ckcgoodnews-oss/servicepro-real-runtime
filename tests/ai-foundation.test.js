const fs = require('fs');

const requiredFiles = [
  'src/db/postgres/033_ai_knowledge_base.sql',
  'src/modules/ai-knowledge-base/sourceTypes.js',
  'src/modules/document-ingestion/ingestionStatuses.js',
  'src/modules/ai-audit/safetyFlags.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 33 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 33 AI foundation test passed.');
