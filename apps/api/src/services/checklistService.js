const { validationError } = require('../errors/domainError');

const ITEM_TYPES = ['checkbox', 'text', 'number', 'photo', 'signature', 'select'];

function normalizeTemplateInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const items = Array.isArray(input.items) ? input.items.map(normalizeTemplateItemInput) : [];
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    appliesTo: input.appliesTo || 'job',
    active: input.active !== false,
    items
  };
}

function normalizeTemplateItemInput(input = {}) {
  if (!input.label) throw validationError('item label is required');
  const itemType = input.itemType || input.type || 'checkbox';
  if (!ITEM_TYPES.includes(itemType)) throw validationError(`Unsupported checklist item type: ${itemType}`);
  return {
    id: input.id || '',
    code: input.code || String(input.label).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: input.label,
    itemType,
    required: input.required === true,
    options: Array.isArray(input.options) ? input.options : [],
    sortOrder: Number(input.sortOrder || 0),
    helpText: input.helpText || ''
  };
}

function instantiateChecklistFromTemplate(template, input = {}) {
  if (!input.jobId) throw validationError('jobId is required');
  const stamp = new Date().toISOString();
  return {
    templateId: template.id,
    templateCode: template.code,
    jobId: input.jobId,
    technicianId: input.technicianId || '',
    status: 'open',
    startedAt: '',
    completedAt: '',
    items: (template.items || []).map(item => ({
      templateItemCode: item.code,
      label: item.label,
      itemType: item.itemType,
      required: item.required === true,
      value: null,
      completed: false,
      notes: '',
      completedAt: ''
    })),
    createdAt: stamp,
    updatedAt: stamp
  };
}

function updateChecklistItem(checklist, code, patch = {}) {
  const items = (checklist.items || []).map(item => {
    if (item.templateItemCode !== code) return item;
    const value = patch.value !== undefined ? patch.value : item.value;
    const completed = patch.completed !== undefined ? patch.completed : value !== null && value !== '';
    return {
      ...item,
      ...patch,
      value,
      completed,
      completedAt: completed ? (patch.completedAt || new Date().toISOString()) : ''
    };
  });
  return { ...checklist, items, updatedAt: new Date().toISOString() };
}

function checklistCompletion(checklist) {
  const items = checklist.items || [];
  const required = items.filter(item => item.required);
  const completedRequired = required.filter(item => item.completed);
  const completed = items.filter(item => item.completed);
  return {
    itemCount: items.length,
    completedCount: completed.length,
    requiredCount: required.length,
    completedRequiredCount: completedRequired.length,
    canComplete: completedRequired.length === required.length
  };
}

function completeChecklist(checklist) {
  const completion = checklistCompletion(checklist);
  if (!completion.canComplete) {
    throw validationError('Required checklist items are not complete', completion);
  }
  return {
    ...checklist,
    status: 'completed',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  ITEM_TYPES,
  normalizeTemplateInput,
  normalizeTemplateItemInput,
  instantiateChecklistFromTemplate,
  updateChecklistItem,
  checklistCompletion,
  completeChecklist
};
