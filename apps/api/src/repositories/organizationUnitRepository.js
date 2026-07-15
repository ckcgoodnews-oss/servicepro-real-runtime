const { makeId, now } = require('../services/id');
const { validationError } = require('../errors/domainError');

const TYPES = ['organization', 'business_unit', 'department', 'location', 'team'];

function normalize(input, existing = {}) {
  const type = input.type ?? existing.type;
  const name = String(input.name ?? existing.name ?? '').trim();
  if (!TYPES.includes(type)) throw validationError('type must be a supported organization unit type');
  if (!name) throw validationError('name is required');
  return {
    type,
    name,
    code: String(input.code ?? existing.code ?? '').trim(),
    parentId: input.parentId === undefined ? (existing.parentId || null) : (input.parentId || null),
    description: String(input.description ?? existing.description ?? '').trim(),
    address: String(input.address ?? existing.address ?? '').trim(),
    timezone: String(input.timezone ?? existing.timezone ?? 'America/Indiana/Indianapolis'),
    active: input.active === undefined ? existing.active !== false : Boolean(input.active)
  };
}

function createOrganizationUnitRepository(store) {
  if (store.type === 'json') return createJsonRepository(store);
  if (store.type === 'postgres') return createPostgresRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensure(data) { if (!data.organizationUnits) data.organizationUnits = []; return data; }

function createJsonRepository(store) {
  return {
    list(tenantId) { return ensure(store.read()).organizationUnits.filter(row => row.tenantId === tenantId).sort((a, b) => a.name.localeCompare(b.name)); },
    findById(tenantId, id) { return ensure(store.read()).organizationUnits.find(row => row.tenantId === tenantId && row.id === id) || null; },
    create(tenantId, input) {
      const data = ensure(store.read()); const value = normalize(input);
      if (value.parentId && !data.organizationUnits.some(row => row.tenantId === tenantId && row.id === value.parentId)) throw validationError('parentId must reference an organization unit in this tenant');
      const row = { id: makeId('org'), tenantId, ...value, createdAt: now(), updatedAt: now() };
      data.organizationUnits.push(row); store.write(data); return row;
    },
    update(tenantId, id, input) {
      const data = ensure(store.read()); const index = data.organizationUnits.findIndex(row => row.tenantId === tenantId && row.id === id); if (index === -1) return null;
      const value = normalize(input, data.organizationUnits[index]);
      if (value.parentId === id) throw validationError('An organization unit cannot be its own parent');
      if (value.parentId && !data.organizationUnits.some(row => row.tenantId === tenantId && row.id === value.parentId)) throw validationError('parentId must reference an organization unit in this tenant');
      data.organizationUnits[index] = { ...data.organizationUnits[index], ...value, id, tenantId, updatedAt: now() }; store.write(data); return data.organizationUnits[index];
    },
    delete(tenantId, id) {
      const data = ensure(store.read());
      if (data.organizationUnits.some(row => row.tenantId === tenantId && row.parentId === id)) throw validationError('Move or remove child units before deleting this unit');
      const before = data.organizationUnits.length; data.organizationUnits = data.organizationUnits.filter(row => !(row.tenantId === tenantId && row.id === id));
      if (data.organizationUnits.length !== before) { store.write(data); return true; } return false;
    }
  };
}

const select = `SELECT id::text, tenant_id AS "tenantId", type, name, code, parent_id::text AS "parentId", description, address, timezone, active, created_at AS "createdAt", updated_at AS "updatedAt" FROM organization_units`;

function createPostgresRepository(store) {
  return {
    async list(tenantId) { return (await store.query(`${select} WHERE tenant_id = $1 ORDER BY name`, [tenantId])).rows; },
    async findById(tenantId, id) { return (await store.query(`${select} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id])).rows[0] || null; },
    async create(tenantId, input) {
      const value = normalize(input);
      if (value.parentId && !(await this.findById(tenantId, value.parentId))) throw validationError('parentId must reference an organization unit in this tenant');
      const result = await store.query(`INSERT INTO organization_units (tenant_id,type,name,code,parent_id,description,address,timezone,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::text,tenant_id AS "tenantId",type,name,code,parent_id::text AS "parentId",description,address,timezone,active,created_at AS "createdAt",updated_at AS "updatedAt"`, [tenantId,value.type,value.name,value.code,value.parentId,value.description,value.address,value.timezone,value.active]);
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id); if (!existing) return null; const value = normalize(input, existing); if (value.parentId === id) throw validationError('An organization unit cannot be its own parent');
      if (value.parentId && !(await this.findById(tenantId, value.parentId))) throw validationError('parentId must reference an organization unit in this tenant');
      const result = await store.query(`UPDATE organization_units SET type=$3,name=$4,code=$5,parent_id=$6,description=$7,address=$8,timezone=$9,active=$10,updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text,tenant_id AS "tenantId",type,name,code,parent_id::text AS "parentId",description,address,timezone,active,created_at AS "createdAt",updated_at AS "updatedAt"`, [tenantId,id,value.type,value.name,value.code,value.parentId,value.description,value.address,value.timezone,value.active]);
      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const children = await store.query('SELECT 1 FROM organization_units WHERE tenant_id=$1 AND parent_id=$2 LIMIT 1', [tenantId,id]); if (children.rows[0]) throw validationError('Move or remove child units before deleting this unit');
      return (await store.query('DELETE FROM organization_units WHERE tenant_id=$1 AND id=$2', [tenantId,id])).rowCount > 0;
    }
  };
}

module.exports = { TYPES, normalizeOrganizationUnit: normalize, createOrganizationUnitRepository };
