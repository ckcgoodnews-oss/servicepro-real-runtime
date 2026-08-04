const { makeId, now } = require('../services/id');

function createDataImportRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data(); d.dataImports ||= [];
      let r = d.dataImports.filter(i => i.tenantId === tenantId);
      if (filters.entity_type) r = r.filter(i => i.entityType === filters.entity_type);
      if (filters.status) r = r.filter(i => i.status === filters.status);
      return r.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    findById(tenantId, id) {
      const d = data(); d.dataImports ||= [];
      return d.dataImports.find(i => i.tenantId === tenantId && i.id === id) || null;
    },

    create(tenantId, input) {
      const d = data(); d.dataImports ||= [];
      const imp = {
        id: makeId('imp'), tenantId,
        entityType: input.entity_type,
        fileName: input.file_name || null,
        status: 'pending',
        totalRows: input.total_rows || 0, processedRows: 0,
        createdRows: 0, updatedRows: 0, skippedRows: 0, errorRows: 0,
        fieldMapping: input.field_mapping || {},
        errors: [], options: input.options || { update_existing: false, skip_duplicates: true },
        startedAt: null, completedAt: null,
        createdBy: input.created_by || null, createdAt: now()
      };
      d.dataImports.push(imp); save(d); return imp;
    },

    updateMapping(tenantId, id, fieldMapping) {
      const d = data(); d.dataImports ||= [];
      const imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      if (!imp) return null;
      imp.fieldMapping = fieldMapping;
      imp.status = 'mapping';
      save(d); return imp;
    },

    startProcessing(tenantId, id) {
      const d = data(); d.dataImports ||= [];
      const imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      if (!imp) return null;
      imp.status = 'processing'; imp.startedAt = now();
      save(d); return imp;
    },

    recordProgress(tenantId, id, progress) {
      const d = data(); d.dataImports ||= [];
      const imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      if (!imp) return null;
      if (progress.processed_rows !== undefined) imp.processedRows = progress.processed_rows;
      if (progress.created_rows !== undefined) imp.createdRows = progress.created_rows;
      if (progress.updated_rows !== undefined) imp.updatedRows = progress.updated_rows;
      if (progress.skipped_rows !== undefined) imp.skippedRows = progress.skipped_rows;
      if (progress.error_rows !== undefined) imp.errorRows = progress.error_rows;
      if (progress.errors) imp.errors = [...imp.errors, ...progress.errors];
      save(d); return imp;
    },

    complete(tenantId, id, finalStatus = 'completed') {
      const d = data(); d.dataImports ||= [];
      const imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      if (!imp) return null;
      imp.status = finalStatus; imp.completedAt = now();
      save(d); return imp;
    },

    // Process rows against a target repository
    processRows(tenantId, id, rows, targetRepo, createFn) {
      // First mark as processing
      let d = data(); d.dataImports ||= [];
      let imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      if (!imp) return null;
      imp.status = 'processing'; imp.startedAt = imp.startedAt || now();
      imp.totalRows = rows.length;
      save(d);

      // Process rows — each createFn call reads/writes the store independently
      let createdRows = 0, errorRows = 0, processedRows = 0;
      const errors = [];
      for (let i = 0; i < rows.length; i++) {
        try {
          const mapped = mapRow(rows[i], imp.fieldMapping);
          createFn(tenantId, mapped);
          createdRows++;
        } catch (err) {
          errorRows++;
          errors.push({ row: i + 1, error: err.message });
        }
        processedRows++;
      }

      // Re-read store to get latest state (createFn may have written)
      d = data(); d.dataImports ||= [];
      imp = d.dataImports.find(i => i.tenantId === tenantId && i.id === id);
      imp.processedRows = processedRows;
      imp.createdRows = createdRows;
      imp.errorRows = errorRows;
      imp.errors = errors;
      imp.status = errorRows === rows.length ? 'failed' : 'completed';
      imp.completedAt = now();
      save(d);
      return imp;
    }
  };
}

function mapRow(row, fieldMapping) {
  const mapped = {};
  for (const [csvCol, entityField] of Object.entries(fieldMapping)) {
    if (row[csvCol] !== undefined) mapped[entityField] = row[csvCol];
  }
  return mapped;
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createDataImportRepository };
