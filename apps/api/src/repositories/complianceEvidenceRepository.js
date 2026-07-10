const { makeId, now } = require('../services/id');
const {
  normalizeFrameworkInput,
  normalizeControlInput,
  normalizeEvidencePackageInput,
  normalizeEvidenceItemInput,
  normalizeControlEvidenceMappingInput,
  normalizeAttestationInput,
  normalizeEvidenceExportInput,
  markEvidenceReviewed,
  approveAttestation,
  completeExport,
  calculateComplianceScore
} = require('../services/complianceEvidenceService');

function createComplianceEvidenceRepository(store) {
  if (store.type === 'json') return createJsonComplianceEvidenceRepository(store);
  if (store.type === 'postgres') return createPostgresComplianceEvidenceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCompliance(data) {
  if (!data.complianceFrameworks) data.complianceFrameworks = [];
  if (!data.complianceControls) data.complianceControls = [];
  if (!data.evidencePackages) data.evidencePackages = [];
  if (!data.evidenceItems) data.evidenceItems = [];
  if (!data.controlEvidenceMappings) data.controlEvidenceMappings = [];
  if (!data.complianceAttestations) data.complianceAttestations = [];
  if (!data.evidenceExports) data.evidenceExports = [];
  return data;
}

function createJsonComplianceEvidenceRepository(store) {
  return {
    listFrameworks(tenantId) {
      return ensureCompliance(store.read()).complianceFrameworks.filter(x => x.tenantId === tenantId).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createFramework(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('cfw'), tenantId, ...normalizeFrameworkInput(input), createdAt: now(), updatedAt: now() };
      data.complianceFrameworks.push(row);
      store.write(data);
      return row;
    },
    listControls(tenantId, filters = {}) {
      return ensureCompliance(store.read()).complianceControls
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.frameworkId || x.frameworkId === filters.frameworkId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.controlCode).localeCompare(String(b.controlCode)));
    },
    createControl(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('ctrl'), tenantId, ...normalizeControlInput(input), createdAt: now(), updatedAt: now() };
      data.complianceControls.push(row);
      store.write(data);
      return row;
    },
    listPackages(tenantId) {
      return ensureCompliance(store.read()).evidencePackages.filter(x => x.tenantId === tenantId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    createPackage(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('evpkg'), tenantId, ...normalizeEvidencePackageInput(input), createdAt: now(), updatedAt: now() };
      data.evidencePackages.push(row);
      store.write(data);
      return row;
    },
    listEvidenceItems(tenantId, filters = {}) {
      return ensureCompliance(store.read()).evidenceItems
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.packageId || x.packageId === filters.packageId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.collectedAt).localeCompare(String(a.collectedAt)));
    },
    createEvidenceItem(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('evitem'), tenantId, ...normalizeEvidenceItemInput(input), createdAt: now(), updatedAt: now() };
      data.evidenceItems.push(row);
      store.write(data);
      return row;
    },
    reviewEvidenceItem(tenantId, id, input = {}) {
      const data = ensureCompliance(store.read());
      const idx = data.evidenceItems.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.evidenceItems[idx] = markEvidenceReviewed(data.evidenceItems[idx], input.reviewedBy || '', input.accepted !== false);
      store.write(data);
      return data.evidenceItems[idx];
    },
    createMapping(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('evmap'), tenantId, ...normalizeControlEvidenceMappingInput(input), createdAt: now(), updatedAt: now() };
      data.controlEvidenceMappings.push(row);
      store.write(data);
      return row;
    },
    listMappings(tenantId, filters = {}) {
      return ensureCompliance(store.read()).controlEvidenceMappings
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.controlId || x.controlId === filters.controlId)
        .filter(x => !filters.evidenceItemId || x.evidenceItemId === filters.evidenceItemId);
    },
    createAttestation(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('attest'), tenantId, ...normalizeAttestationInput(input), createdAt: now(), updatedAt: now() };
      data.complianceAttestations.push(row);
      store.write(data);
      return row;
    },
    approveAttestation(tenantId, id, approvedBy) {
      const data = ensureCompliance(store.read());
      const idx = data.complianceAttestations.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.complianceAttestations[idx] = approveAttestation(data.complianceAttestations[idx], approvedBy);
      store.write(data);
      return data.complianceAttestations[idx];
    },
    createExport(tenantId, input) {
      const data = ensureCompliance(store.read());
      const row = { id: makeId('evexp'), tenantId, ...normalizeEvidenceExportInput(input), createdAt: now(), updatedAt: now() };
      data.evidenceExports.push(row);
      store.write(data);
      return row;
    },
    completeExport(tenantId, id, artifactUri) {
      const data = ensureCompliance(store.read());
      const idx = data.evidenceExports.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.evidenceExports[idx] = completeExport(data.evidenceExports[idx], artifactUri);
      store.write(data);
      return data.evidenceExports[idx];
    },
    score(tenantId, filters = {}) {
      return calculateComplianceScore({
        controls: this.listControls(tenantId, filters),
        mappings: this.listMappings(tenantId, filters),
        evidenceItems: this.listEvidenceItems(tenantId, filters)
      });
    }
  };
}

function createPostgresComplianceEvidenceRepository(store) {
  async function rows(sql, params) {
    return (await store.query(sql, params)).rows;
  }

  return {
    async listFrameworks(tenantId) {
      return rows(`SELECT id::text, tenant_id as "tenantId", code, name, description, version, status, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM compliance_frameworks WHERE tenant_id=$1 ORDER BY name`, [tenantId]);
    },
    async createFramework(tenantId, input) {
      const x = normalizeFrameworkInput(input);
      return (await rows(`INSERT INTO compliance_frameworks (tenant_id, code, name, description, version, status, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING id::text, tenant_id as "tenantId", code, name, description, version, status, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.code, x.name, x.description, x.version, x.status, JSON.stringify(x.metadata || {})]))[0];
    },
    async listControls(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.frameworkId) { params.push(filters.frameworkId); where += ` AND framework_id=$${params.length}`; }
      if (filters.status) { params.push(filters.status); where += ` AND status=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", framework_id::text as "frameworkId", control_code as "controlCode", title, description, owner_team as "ownerTeam", frequency, status, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM compliance_controls ${where} ORDER BY control_code`, params);
    },
    async createControl(tenantId, input) {
      const x = normalizeControlInput(input);
      return (await rows(`INSERT INTO compliance_controls (tenant_id, framework_id, control_code, title, description, owner_team, frequency, status, metadata) VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING id::text, tenant_id as "tenantId", framework_id::text as "frameworkId", control_code as "controlCode", title, description, owner_team as "ownerTeam", frequency, status, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.frameworkId, x.controlCode, x.title, x.description, x.ownerTeam, x.frequency, x.status, JSON.stringify(x.metadata || {})]))[0];
    },
    async listPackages(tenantId) {
      return rows(`SELECT id::text, tenant_id as "tenantId", code, name, description, period_start as "periodStart", period_end as "periodEnd", owner_team as "ownerTeam", locked, locked_at as "lockedAt", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM evidence_packages WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenantId]);
    },
    async createPackage(tenantId, input) {
      const x = normalizeEvidencePackageInput(input);
      return (await rows(`INSERT INTO evidence_packages (tenant_id, code, name, description, period_start, period_end, owner_team, locked, locked_at, metadata) VALUES ($1,$2,$3,$4,NULLIF($5,'')::date,NULLIF($6,'')::date,$7,$8,NULLIF($9,'')::timestamptz,$10::jsonb) RETURNING id::text, tenant_id as "tenantId", code, name, description, period_start as "periodStart", period_end as "periodEnd", owner_team as "ownerTeam", locked, locked_at as "lockedAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.code, x.name, x.description, x.periodStart, x.periodEnd, x.ownerTeam, x.locked, x.lockedAt, JSON.stringify(x.metadata || {})]))[0];
    },
    async listEvidenceItems(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.packageId) { params.push(filters.packageId); where += ` AND package_id=$${params.length}`; }
      if (filters.status) { params.push(filters.status); where += ` AND status=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", package_id::text as "packageId", title, description, evidence_type as "evidenceType", source_system as "sourceSystem", artifact_uri as "artifactUri", collected_by as "collectedBy", collected_at as "collectedAt", reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", expires_at as "expiresAt", status, hash, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM evidence_items ${where} ORDER BY collected_at DESC`, params);
    },
    async createEvidenceItem(tenantId, input) {
      const x = normalizeEvidenceItemInput(input);
      return (await rows(`INSERT INTO evidence_items (tenant_id, package_id, title, description, evidence_type, source_system, artifact_uri, collected_by, collected_at, reviewed_by, reviewed_at, expires_at, status, hash, metadata) VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9::timestamptz,$10,NULLIF($11,'')::timestamptz,NULLIF($12,'')::timestamptz,$13,$14,$15::jsonb) RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", title, description, evidence_type as "evidenceType", source_system as "sourceSystem", artifact_uri as "artifactUri", collected_by as "collectedBy", collected_at as "collectedAt", reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", expires_at as "expiresAt", status, hash, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.packageId, x.title, x.description, x.evidenceType, x.sourceSystem, x.artifactUri, x.collectedBy, x.collectedAt, x.reviewedBy, x.reviewedAt, x.expiresAt, x.status, x.hash, JSON.stringify(x.metadata || {})]))[0];
    },
    async reviewEvidenceItem(tenantId, id, input = {}) {
      const status = input.accepted === false ? 'rejected' : 'accepted';
      return (await rows(`UPDATE evidence_items SET reviewed_by=$3, reviewed_at=now(), status=$4, updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", title, description, evidence_type as "evidenceType", source_system as "sourceSystem", artifact_uri as "artifactUri", collected_by as "collectedBy", collected_at as "collectedAt", reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", expires_at as "expiresAt", status, hash, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, id, input.reviewedBy || '', status]))[0] || null;
    },
    async createMapping(tenantId, input) {
      const x = normalizeControlEvidenceMappingInput(input);
      return (await rows(`INSERT INTO control_evidence_mappings (tenant_id, control_id, evidence_item_id, relevance, notes, metadata) VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6::jsonb) RETURNING id::text, tenant_id as "tenantId", control_id::text as "controlId", evidence_item_id::text as "evidenceItemId", relevance, notes, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.controlId, x.evidenceItemId, x.relevance, x.notes, JSON.stringify(x.metadata || {})]))[0];
    },
    async listMappings(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.controlId) { params.push(filters.controlId); where += ` AND control_id=$${params.length}`; }
      if (filters.evidenceItemId) { params.push(filters.evidenceItemId); where += ` AND evidence_item_id=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", control_id::text as "controlId", evidence_item_id::text as "evidenceItemId", relevance, notes, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM control_evidence_mappings ${where}`, params);
    },
    async createAttestation(tenantId, input) {
      const x = normalizeAttestationInput(input);
      return (await rows(`INSERT INTO compliance_attestations (tenant_id, package_id, attested_by, attested_at, statement, status, approved_by, approved_at, rejected_reason, metadata) VALUES ($1,$2::uuid,$3,$4::timestamptz,$5,$6,$7,NULLIF($8,'')::timestamptz,$9,$10::jsonb) RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", attested_by as "attestedBy", attested_at as "attestedAt", statement, status, approved_by as "approvedBy", approved_at as "approvedAt", rejected_reason as "rejectedReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.packageId, x.attestedBy, x.attestedAt, x.statement, x.status, x.approvedBy, x.approvedAt, x.rejectedReason, JSON.stringify(x.metadata || {})]))[0];
    },
    async approveAttestation(tenantId, id, approvedBy) {
      return (await rows(`UPDATE compliance_attestations SET status='approved', approved_by=$3, approved_at=now(), updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", attested_by as "attestedBy", attested_at as "attestedAt", statement, status, approved_by as "approvedBy", approved_at as "approvedAt", rejected_reason as "rejectedReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, id, approvedBy]))[0] || null;
    },
    async createExport(tenantId, input) {
      const x = normalizeEvidenceExportInput(input);
      return (await rows(`INSERT INTO evidence_exports (tenant_id, package_id, export_format, status, requested_by, requested_at, completed_at, artifact_uri, failure_reason, metadata) VALUES ($1,$2::uuid,$3,$4,$5,$6::timestamptz,NULLIF($7,'')::timestamptz,$8,$9,$10::jsonb) RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", export_format as "exportFormat", status, requested_by as "requestedBy", requested_at as "requestedAt", completed_at as "completedAt", artifact_uri as "artifactUri", failure_reason as "failureReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.packageId, x.exportFormat, x.status, x.requestedBy, x.requestedAt, x.completedAt, x.artifactUri, x.failureReason, JSON.stringify(x.metadata || {})]))[0];
    },
    async completeExport(tenantId, id, artifactUri) {
      return (await rows(`UPDATE evidence_exports SET status='completed', artifact_uri=$3, completed_at=now(), updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", package_id::text as "packageId", export_format as "exportFormat", status, requested_by as "requestedBy", requested_at as "requestedAt", completed_at as "completedAt", artifact_uri as "artifactUri", failure_reason as "failureReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, id, artifactUri]))[0] || null;
    },
    async score(tenantId, filters = {}) {
      return calculateComplianceScore({
        controls: await this.listControls(tenantId, filters),
        mappings: await this.listMappings(tenantId, filters),
        evidenceItems: await this.listEvidenceItems(tenantId, filters)
      });
    }
  };
}

module.exports = { createComplianceEvidenceRepository };
