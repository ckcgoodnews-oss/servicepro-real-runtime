const { validationError } = require('../errors/domainError');

function normalizePostalCode(value = '') {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeTerritoryInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    active: input.active !== false,
    priority: Number(input.priority || 100),
    color: input.color || '',
    metadata: input.metadata || {}
  };
}

function normalizeCoverageRuleInput(input = {}) {
  if (!input.territoryId) throw validationError('territoryId is required');
  if (!input.ruleType) throw validationError('ruleType is required');

  const supported = ['postal_exact', 'postal_prefix', 'city_state', 'county_state'];
  if (!supported.includes(input.ruleType)) throw validationError(`Unsupported coverage rule type: ${input.ruleType}`);

  return {
    territoryId: input.territoryId,
    ruleType: input.ruleType,
    postalCode: normalizePostalCode(input.postalCode || ''),
    postalPrefix: normalizePostalCode(input.postalPrefix || ''),
    city: input.city || '',
    county: input.county || '',
    state: input.state || '',
    country: input.country || 'US',
    active: input.active !== false,
    priority: Number(input.priority || 100)
  };
}

function normalizeTechnicianTerritoryInput(input = {}) {
  if (!input.technicianId) throw validationError('technicianId is required');
  if (!input.territoryId) throw validationError('territoryId is required');
  return {
    technicianId: input.technicianId,
    territoryId: input.territoryId,
    preferenceRank: Number(input.preferenceRank || 100),
    active: input.active !== false,
    notes: input.notes || ''
  };
}

function coverageRuleMatches(rule, address = {}) {
  if (!rule || rule.active === false) return false;

  const postal = normalizePostalCode(address.postalCode || address.zip || '');
  const city = String(address.city || '').trim().toUpperCase();
  const county = String(address.county || '').trim().toUpperCase();
  const state = String(address.state || '').trim().toUpperCase();
  const country = String(address.country || 'US').trim().toUpperCase();

  if (rule.country && String(rule.country).toUpperCase() !== country) return false;

  if (rule.ruleType === 'postal_exact') {
    return postal && postal === normalizePostalCode(rule.postalCode);
  }
  if (rule.ruleType === 'postal_prefix') {
    return postal && postal.startsWith(normalizePostalCode(rule.postalPrefix));
  }
  if (rule.ruleType === 'city_state') {
    return city === String(rule.city || '').trim().toUpperCase() && state === String(rule.state || '').trim().toUpperCase();
  }
  if (rule.ruleType === 'county_state') {
    return county === String(rule.county || '').trim().toUpperCase() && state === String(rule.state || '').trim().toUpperCase();
  }
  return false;
}

function rankTerritoryMatches(territories = [], rules = [], address = {}) {
  const activeTerritories = new Map(territories.filter(t => t.active !== false).map(t => [t.id, t]));
  const matches = [];

  for (const rule of rules) {
    if (!coverageRuleMatches(rule, address)) continue;
    const territory = activeTerritories.get(rule.territoryId);
    if (!territory) continue;
    matches.push({
      territory,
      rule,
      score: Number(rule.priority || 100) + Number(territory.priority || 100)
    });
  }

  return matches.sort((a, b) => a.score - b.score).map(x => ({
    territoryId: x.territory.id,
    code: x.territory.code,
    name: x.territory.name,
    ruleType: x.rule.ruleType,
    score: x.score
  }));
}

function rankTechniciansForTerritory(assignments = [], territoryId) {
  return assignments
    .filter(x => x.active !== false && x.territoryId === territoryId)
    .sort((a, b) => Number(a.preferenceRank || 100) - Number(b.preferenceRank || 100))
    .map(x => ({
      technicianId: x.technicianId,
      territoryId: x.territoryId,
      preferenceRank: Number(x.preferenceRank || 100)
    }));
}

module.exports = {
  normalizePostalCode,
  normalizeTerritoryInput,
  normalizeCoverageRuleInput,
  normalizeTechnicianTerritoryInput,
  coverageRuleMatches,
  rankTerritoryMatches,
  rankTechniciansForTerritory
};
