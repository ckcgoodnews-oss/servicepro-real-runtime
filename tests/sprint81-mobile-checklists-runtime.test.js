const fs = require('fs');

const required = [
  'apps/api/src/services/checklistService.js',
  'apps/api/src/repositories/checklistRepository.js',
  'apps/api/src/routes/checklists.js',
  'scripts/seed-checklists.js',
  'packages/database/postgres/081_mobile_checklists_runtime.sql',
  'docs/sprint81-mobile-checklists-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 81 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeTemplateInput,
  instantiateChecklistFromTemplate,
  updateChecklistItem,
  checklistCompletion,
  completeChecklist
} = require('../apps/api/src/services/checklistService');

const template = {
  id: 'tmpl1',
  ...normalizeTemplateInput({
    name: 'Job Closeout',
    items: [
      { code: 'APPROVED', label: 'Customer approved', required: true },
      { code: 'NOTES', label: 'Notes', itemType: 'text' }
    ]
  })
};

let checklist = instantiateChecklistFromTemplate(template, { jobId: 'job1', technicianId: 'tech1' });
let completion = checklistCompletion(checklist);
if (completion.canComplete) {
  console.error('Checklist should not complete before required item is done.');
  process.exit(1);
}

checklist = updateChecklistItem(checklist, 'APPROVED', { value: true, completed: true });
completion = checklistCompletion(checklist);
if (!completion.canComplete) {
  console.error('Checklist should be completable after required item is done.');
  process.exit(1);
}

const done = completeChecklist(checklist);
if (done.status !== 'completed' || !done.completedAt) {
  console.error('Checklist completion failed.');
  process.exit(1);
}

console.log('Sprint 81 mobile checklists runtime patch test passed.');
