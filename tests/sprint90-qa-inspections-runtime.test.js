const fs = require('fs');

const required = [
  'apps/api/src/services/qaInspectionService.js',
  'apps/api/src/repositories/qaInspectionRepository.js',
  'apps/api/src/routes/qaInspections.js',
  'scripts/seed-qa-inspections.js',
  'packages/database/postgres/090_qa_inspections_runtime.sql',
  'docs/sprint90-qa-inspections-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 90 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeInspectionTemplateInput,
  instantiateInspection,
  updateInspectionItem,
  scoreInspection,
  completeInspection
} = require('../apps/api/src/services/qaInspectionService');

const template = {
  id: 'tmpl1',
  ...normalizeInspectionTemplateInput({
    name: 'Job QA',
    passingScorePercent: 100,
    items: [
      { code: 'WORK', label: 'Work complete', itemType: 'pass_fail', required: true },
      { code: 'PHOTO', label: 'Photo attached', itemType: 'photo_required', required: true }
    ]
  })
};

let inspection = instantiateInspection(template, { entityType: 'job', entityId: 'job1', jobId: 'job1' });
let score = scoreInspection(inspection, template.passingScorePercent);
if (score.passed) {
  console.error('Empty inspection should not pass.');
  process.exit(1);
}

inspection = updateInspectionItem(inspection, 'WORK', { value: true });
inspection = updateInspectionItem(inspection, 'PHOTO', { mediaAttachmentIds: ['media1'] });
score = scoreInspection(inspection, template.passingScorePercent);
if (!score.passed || score.scorePercent !== 100) {
  console.error('Completed inspection score failed.');
  process.exit(1);
}

const completed = completeInspection(inspection, template.passingScorePercent);
if (completed.status !== 'passed' || !completed.passed) {
  console.error('Inspection completion failed.');
  process.exit(1);
}

console.log('Sprint 90 QA inspections runtime patch test passed.');
