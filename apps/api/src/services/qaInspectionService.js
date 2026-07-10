const { validationError } = require('../errors/domainError');

const QA_ITEM_TYPES = ['pass_fail', 'score', 'text', 'photo_required', 'signature'];
const QA_INSPECTION_STATUSES = ['draft', 'in_progress', 'passed', 'failed', 'needs_correction', 'void'];
const QA_ENTITY_TYPES = ['job', 'customer', 'asset', 'technician'];

function normalizeInspectionTemplateItem(input = {}) {
  if (!input.label) throw validationError('item label is required');
  const itemType = input.itemType || 'pass_fail';
  if (!QA_ITEM_TYPES.includes(itemType)) throw validationError(`Unsupported QA item type: ${itemType}`);

  return {
    code: input.code || String(input.label).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: input.label,
    itemType,
    required: input.required !== false,
    weight: Number(input.weight || 1),
    maxScore: Number(input.maxScore || 1),
    passThreshold: Number(input.passThreshold || 1),
    sortOrder: Number(input.sortOrder || 0),
    helpText: input.helpText || ''
  };
}

function normalizeInspectionTemplateInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    appliesTo: input.appliesTo || 'job',
    active: input.active !== false,
    passingScorePercent: Number(input.passingScorePercent || 100),
    items: Array.isArray(input.items) ? input.items.map(normalizeInspectionTemplateItem) : [],
    metadata: input.metadata || {}
  };
}

function instantiateInspection(template, input = {}) {
  const entityType = input.entityType || template.appliesTo || 'job';
  if (!QA_ENTITY_TYPES.includes(entityType)) throw validationError(`Unsupported inspection entity type: ${entityType}`);
  if (!input.entityId) throw validationError('entityId is required');

  return {
    templateId: template.id,
    templateCode: template.code,
    entityType,
    entityId: input.entityId,
    jobId: input.jobId || (entityType === 'job' ? input.entityId : ''),
    customerId: input.customerId || '',
    assetId: input.assetId || (entityType === 'asset' ? input.entityId : ''),
    technicianId: input.technicianId || '',
    inspectorId: input.inspectorId || '',
    status: 'draft',
    scorePercent: 0,
    passed: false,
    startedAt: input.startedAt || '',
    completedAt: '',
    correctiveActionRequired: false,
    correctiveActionNotes: '',
    items: (template.items || []).map(item => ({
      templateItemCode: item.code,
      label: item.label,
      itemType: item.itemType,
      required: item.required,
      weight: item.weight,
      maxScore: item.maxScore,
      passThreshold: item.passThreshold,
      value: null,
      score: 0,
      passed: false,
      notes: '',
      mediaAttachmentIds: []
    })),
    metadata: input.metadata || {}
  };
}

function updateInspectionItem(inspection, itemCode, patch = {}) {
  const items = (inspection.items || []).map(item => {
    if (item.templateItemCode !== itemCode) return item;

    let passed = patch.passed;
    let score = patch.score !== undefined ? Number(patch.score) : Number(item.score || 0);
    const value = patch.value !== undefined ? patch.value : item.value;

    if (item.itemType === 'pass_fail') {
      passed = patch.passed !== undefined ? patch.passed === true : value === true;
      score = passed ? Number(item.maxScore || 1) : 0;
    } else if (item.itemType === 'score') {
      passed = score >= Number(item.passThreshold || item.maxScore || 1);
    } else if (item.itemType === 'text') {
      passed = item.required ? Boolean(value) : true;
      score = passed ? Number(item.maxScore || 1) : 0;
    } else if (item.itemType === 'photo_required') {
      const mediaIds = Array.isArray(patch.mediaAttachmentIds) ? patch.mediaAttachmentIds : (item.mediaAttachmentIds || []);
      passed = mediaIds.length > 0;
      score = passed ? Number(item.maxScore || 1) : 0;
    } else if (item.itemType === 'signature') {
      passed = Boolean(value);
      score = passed ? Number(item.maxScore || 1) : 0;
    }

    return {
      ...item,
      ...patch,
      value,
      score,
      passed: passed === true,
      notes: patch.notes !== undefined ? patch.notes : item.notes,
      mediaAttachmentIds: Array.isArray(patch.mediaAttachmentIds) ? patch.mediaAttachmentIds : (item.mediaAttachmentIds || [])
    };
  });

  return { ...inspection, items, updatedAt: new Date().toISOString() };
}

function scoreInspection(inspection, passingScorePercent = 100) {
  const items = inspection.items || [];
  const weightedMax = items.reduce((sum, item) => sum + Number(item.maxScore || 1) * Number(item.weight || 1), 0);
  const weightedScore = items.reduce((sum, item) => sum + Number(item.score || 0) * Number(item.weight || 1), 0);
  const requiredFailed = items.some(item => item.required && !item.passed);
  const scorePercent = weightedMax <= 0 ? 0 : Math.round((weightedScore / weightedMax) * 10000) / 100;
  const passed = !requiredFailed && scorePercent >= Number(passingScorePercent || 100);
  return {
    itemCount: items.length,
    passedCount: items.filter(item => item.passed).length,
    failedCount: items.filter(item => !item.passed).length,
    scorePercent,
    passed,
    correctiveActionRequired: !passed
  };
}

function completeInspection(inspection, passingScorePercent = 100) {
  const score = scoreInspection(inspection, passingScorePercent);
  return {
    ...inspection,
    status: score.passed ? 'passed' : 'needs_correction',
    scorePercent: score.scorePercent,
    passed: score.passed,
    correctiveActionRequired: score.correctiveActionRequired,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  QA_ITEM_TYPES,
  QA_INSPECTION_STATUSES,
  QA_ENTITY_TYPES,
  normalizeInspectionTemplateItem,
  normalizeInspectionTemplateInput,
  instantiateInspection,
  updateInspectionItem,
  scoreInspection,
  completeInspection
};
