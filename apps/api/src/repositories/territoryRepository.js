const { makeId, now } = require('../services/id');
const {
  normalizeTerritoryInput,
  normalizeCoverageRuleInput,
  normalizeTechnicianTerritoryInput,
  rankTerritoryMatches,
  rankTechniciansForTerritory
} = require('../services/territoryService');

function createTerritoryRepository(store) {
  if (store.type === 'json') return createJsonTerritoryRepository(store);
  if (store.type === 'postgres') return createPostgresTerritoryRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTerritories(data) {
  if (!data.serviceTerritories) data.serviceTerritories = [];
  if (!data.territoryCoverageRules) data.territoryCoverageRules = [];
  if (!data.technicianTerritories) data.technicianTerritories = [];
  return data;
}

function createJsonTerritoryRepository(store) {
  return {
    listTerritories(tenantId) {
      return ensureTerritories(store.read()).serviceTerritories.filter(x => x.tenantId === tenantId);
    },
    findTerritoryById(tenantId, id) {
      return this.listTerritories(tenantId).find(x => x.id === id) || null;
    },
    createTerritory(tenantId, input) {
      const data = ensureTerritories(store.read());
      const territory = { id: makeId('territory'), tenantId, ...normalizeTerritoryInput(input), createdAt: now(), updatedAt: now() };
      data.serviceTerritories.push(territory);
      store.write(data);
      return territory;
    },
    listCoverageRules(tenantId, territoryId = '') {
      return ensureTerritories(store.read()).territoryCoverageRules.filter(x => x.tenantId === tenantId && (!territoryId || x.territoryId === territoryId));
    },
    createCoverageRule(tenantId, input) {
      const data = ensureTerritories(store.read());
      const rule = { id: makeId('terrule'), tenantId, ...normalizeCoverageRuleInput(input), createdAt: now(), updatedAt: now() };
      data.territoryCoverageRules.push(rule);
      store.write(data);
      return rule;
    },
    listTechnicianTerritories(tenantId, territoryId = '') {
      return ensureTerritories(store.read()).technicianTerritories.filter(x => x.tenantId === tenantId && (!territoryId || x.territoryId === territoryId));
    },
    createTechnicianTerritory(tenantId, input) {
      const data = ensureTerritories(store.read());
      const assignment = { id: makeId('techterritory'), tenantId, ...normalizeTechnicianTerritoryInput(input), createdAt: now(), updatedAt: now() };
      data.technicianTerritories.push(assignment);
      store.write(data);
      return assignment;
    },
    matchAddress(tenantId, address) {
      const data = ensureTerritories(store.read());
      const territories = data.serviceTerritories.filter(x => x.tenantId === tenantId);
      const rules = data.territoryCoverageRules.filter(x => x.tenantId === tenantId);
      const matches = rankTerritoryMatches(territories, rules, address);
      const best = matches[0] || null;
      const technicians = best ? rankTechniciansForTerritory(data.technicianTerritories.filter(x => x.tenantId === tenantId), best.territoryId) : [];
      return { matches, best, technicians };
    }
  };
}

function createPostgresTerritoryRepository(store) {
  const territorySelect = `SELECT id::text, tenant_id as "tenantId", code, name, description, active,
    priority, color, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM service_territories`;
  const ruleSelect = `SELECT id::text, tenant_id as "tenantId", territory_id::text as "territoryId",
    rule_type as "ruleType", postal_code as "postalCode", postal_prefix as "postalPrefix",
    city, county, state, country, active, priority, created_at as "createdAt", updated_at as "updatedAt"
    FROM territory_coverage_rules`;
  const techSelect = `SELECT id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
    territory_id::text as "territoryId", preference_rank as "preferenceRank", active, notes,
    created_at as "createdAt", updated_at as "updatedAt" FROM technician_territories`;

  return {
    async listTerritories(tenantId) {
      const result = await store.query(`${territorySelect} WHERE tenant_id = $1 ORDER BY priority, name`, [tenantId]);
      return result.rows;
    },
    async findTerritoryById(tenantId, id) {
      const result = await store.query(`${territorySelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createTerritory(tenantId, input) {
      const x = normalizeTerritoryInput(input);
      const result = await store.query(
        `INSERT INTO service_territories (tenant_id, code, name, description, active, priority, color, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, active,
                   priority, color, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.active, x.priority, x.color, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listCoverageRules(tenantId, territoryId = '') {
      const params = territoryId ? [tenantId, territoryId] : [tenantId];
      const where = territoryId ? 'WHERE tenant_id = $1 AND territory_id = $2' : 'WHERE tenant_id = $1';
      const result = await store.query(`${ruleSelect} ${where} ORDER BY priority`, params);
      return result.rows;
    },
    async createCoverageRule(tenantId, input) {
      const x = normalizeCoverageRuleInput(input);
      const result = await store.query(
        `INSERT INTO territory_coverage_rules
         (tenant_id, territory_id, rule_type, postal_code, postal_prefix, city, county, state, country, active, priority)
         VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id::text, tenant_id as "tenantId", territory_id::text as "territoryId",
                   rule_type as "ruleType", postal_code as "postalCode", postal_prefix as "postalPrefix",
                   city, county, state, country, active, priority, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.territoryId, x.ruleType, x.postalCode, x.postalPrefix, x.city, x.county, x.state, x.country, x.active, x.priority]
      );
      return result.rows[0];
    },
    async listTechnicianTerritories(tenantId, territoryId = '') {
      const params = territoryId ? [tenantId, territoryId] : [tenantId];
      const where = territoryId ? 'WHERE tenant_id = $1 AND territory_id = $2' : 'WHERE tenant_id = $1';
      const result = await store.query(`${techSelect} ${where} ORDER BY preference_rank`, params);
      return result.rows;
    },
    async createTechnicianTerritory(tenantId, input) {
      const x = normalizeTechnicianTerritoryInput(input);
      const result = await store.query(
        `INSERT INTO technician_territories (tenant_id, technician_id, territory_id, preference_rank, active, notes)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6)
         RETURNING id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
                   territory_id::text as "territoryId", preference_rank as "preferenceRank", active, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.technicianId, x.territoryId, x.preferenceRank, x.active, x.notes]
      );
      return result.rows[0];
    },
    async matchAddress(tenantId, address) {
      const territories = await this.listTerritories(tenantId);
      const rules = await this.listCoverageRules(tenantId);
      const assignments = await this.listTechnicianTerritories(tenantId);
      const matches = rankTerritoryMatches(territories, rules, address);
      const best = matches[0] || null;
      const technicians = best ? rankTechniciansForTerritory(assignments, best.territoryId) : [];
      return { matches, best, technicians };
    }
  };
}

module.exports = { createTerritoryRepository };
