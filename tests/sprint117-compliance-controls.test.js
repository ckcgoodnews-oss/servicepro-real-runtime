const fs = require('fs');

const required = [
  'apps/api/src/services/complianceControlService.js',
  'apps/api/src/repositories/complianceControlRepository.js',
  'apps/api/src/routes/complianceControls.js',
  'scripts/seed-compliance-controls.js',
  'packages/database/postgres/117_compliance_controls.sql',
  'docs/sprint117-compliance-controls.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 117 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeFrameworkInput,
  normalizeControlInput,
  normalizeEvidenceMappingInput,
  normalizeTestRunInput,
  normalizeGapInput,
  normalizeCorrectiveActionInput,
  nextDueDate,
  startTestRun,
  completeTestRun,
  closeGap,
  acceptGap,
  completeCorrectiveAction,
  evidenceIsFresh,
  controlCoverage
} = require('../apps/api/src/services/complianceControlService');

const framework = normalizeFrameworkInput({ name: 'SOC 2', version: '2026' });
if (framework.code !== 'SOC-2') process.exit(1);

const control = { id: 'control1', ...normalizeControlInput({ frameworkId: 'fw1', controlCode: 'CC6.1', title: 'Access', frequency: 'quarterly' }) };
if (!nextDueDate(control, '2026-07-07T00:00:00.000Z').startsWith('2026-10-05')) process.exit(1);

const evidence = normalizeEvidenceMappingInput({ controlId: control.id, title: 'Access Review', evidenceType: 'report', validUntil: '2026-12-31T00:00:00.000Z' });
if (!evidenceIsFresh(evidence, '2026-08-01T00:00:00.000Z')) process.exit(1);

let testRun = normalizeTestRunInput({ controlId: control.id, sampleSize: 10 });
testRun = startTestRun(testRun);
if (testRun.status !== 'in_progress') process.exit(1);
testRun = completeTestRun(testRun, true, 'Passed');
if (testRun.status !== 'passed') process.exit(1);

let gap = normalizeGapInput({ controlId: control.id, title: 'Gap', severity: 'high' });
gap = acceptGap(gap);
if (gap.status !== 'accepted') process.exit(1);
gap = closeGap({ ...gap, status: 'open' });
if (gap.status !== 'closed' || !gap.closedAt) process.exit(1);

let action = normalizeCorrectiveActionInput({ gapId: 'gap1', title: 'Fix' });
action = completeCorrectiveAction(action);
if (action.status !== 'completed') process.exit(1);

const coverage = controlCoverage({ controls: [control], evidenceMappings: [evidence], testRuns: [testRun], gaps: [gap] });
if (coverage.totalControls !== 1 || coverage.controlsWithEvidence !== 1 || coverage.controlsPassed !== 1) process.exit(1);

console.log('Sprint 117 compliance control mapping patch test passed.');
