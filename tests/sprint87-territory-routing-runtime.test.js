const fs = require('fs');

const required = [
  'apps/api/src/services/territoryService.js',
  'apps/api/src/repositories/territoryRepository.js',
  'apps/api/src/routes/territories.js',
  'scripts/seed-territories.js',
  'packages/database/postgres/087_territory_routing_runtime.sql',
  'docs/sprint87-territory-routing-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 87 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePostalCode,
  normalizeTerritoryInput,
  normalizeCoverageRuleInput,
  coverageRuleMatches,
  rankTerritoryMatches,
  rankTechniciansForTerritory
} = require('../apps/api/src/services/territoryService');

if (normalizePostalCode(' 462 20 ') !== '46220') {
  console.error('Postal normalization failed.');
  process.exit(1);
}

const territory = { id: 't1', ...normalizeTerritoryInput({ name: 'Indy North', priority: 10 }) };
const rule = normalizeCoverageRuleInput({ territoryId: 't1', ruleType: 'postal_prefix', postalPrefix: '462', priority: 5 });

if (!coverageRuleMatches(rule, { postalCode: '46220', country: 'US' })) {
  console.error('Coverage rule matching failed.');
  process.exit(1);
}

const matches = rankTerritoryMatches([territory], [rule], { postalCode: '46220' });
if (matches.length !== 1 || matches[0].territoryId !== 't1') {
  console.error('Territory ranking failed.');
  process.exit(1);
}

const techs = rankTechniciansForTerritory([
  { technicianId: 'tech2', territoryId: 't1', preferenceRank: 2 },
  { technicianId: 'tech1', territoryId: 't1', preferenceRank: 1 }
], 't1');

if (techs[0].technicianId !== 'tech1') {
  console.error('Technician territory ranking failed.');
  process.exit(1);
}

console.log('Sprint 87 territory routing runtime patch test passed.');
