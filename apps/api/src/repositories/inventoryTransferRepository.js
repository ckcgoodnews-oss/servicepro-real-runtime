const { makeId, now } = require('../services/id');
const { normalizeTransferInput } = require('../services/warehouseService');

function createInventoryTransferRepository(store) {
  if (store.type === 'json') return createJsonInventoryTransferRepository(store);
  if (store.type === 'postgres') return createPostgresInventoryTransferRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTransfers(data) {
  if (!data.inventoryTransfers) data.inventoryTransfers = [];
  return data;
}

function createJsonInventoryTransferRepository(store) {
  return {
    list(tenantId) {
      return ensureTransfers(store.read()).inventoryTransfers.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return this.list(tenantId).find(x => x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureTransfers(store.read());
      const transfer = { id: makeId('transfer'), tenantId, ...normalizeTransferInput(input), createdAt: now(), updatedAt: now() };
      data.inventoryTransfers.push(transfer);
      store.write(data);
      return transfer;
    },
    update(tenantId, id, input) {
      const data = ensureTransfers(store.read());
      const idx = data.inventoryTransfers.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.inventoryTransfers[idx] = { ...data.inventoryTransfers[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.inventoryTransfers[idx];
    },
    complete(tenantId, id, input = {}) {
      return this.update(tenantId, id, { status: 'completed', completedDate: input.completedDate || new Date().toISOString().slice(0, 10), notes: input.notes || '' });
    }
  };
}

function createPostgresInventoryTransferRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", from_warehouse_id::text as "fromWarehouseId",
    from_bin_id::text as "fromBinId", to_warehouse_id::text as "toWarehouseId", to_bin_id::text as "toBinId",
    status, transfer_date as "transferDate", completed_date as "completedDate", reference, notes, lines,
    created_at as "createdAt", updated_at as "updatedAt" FROM inventory_transfers`;
  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeTransferInput(input);
      const result = await store.query(
        `INSERT INTO inventory_transfers
         (tenant_id, from_warehouse_id, from_bin_id, to_warehouse_id, to_bin_id, status, transfer_date, completed_date, reference, notes, lines)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,$4::uuid,NULLIF($5,'')::uuid,$6,$7::date,NULLIF($8,'')::date,$9,$10,$11::jsonb)
         RETURNING id::text, tenant_id as "tenantId", from_warehouse_id::text as "fromWarehouseId",
                   from_bin_id::text as "fromBinId", to_warehouse_id::text as "toWarehouseId", to_bin_id::text as "toBinId",
                   status, transfer_date as "transferDate", completed_date as "completedDate", reference, notes, lines,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.fromWarehouseId, x.fromBinId, x.toWarehouseId, x.toBinId, x.status, x.transferDate, x.completedDate, x.reference, x.notes, JSON.stringify(x.lines)]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE inventory_transfers SET status=$3, completed_date=NULLIF($4,'')::date, reference=$5, notes=$6,
         lines=$7::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", from_warehouse_id::text as "fromWarehouseId",
                   from_bin_id::text as "fromBinId", to_warehouse_id::text as "toWarehouseId", to_bin_id::text as "toBinId",
                   status, transfer_date as "transferDate", completed_date as "completedDate", reference, notes, lines,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.status || 'draft', x.completedDate || '', x.reference || '', x.notes || '', JSON.stringify(x.lines || [])]
      );
      return result.rows[0] || null;
    },
    async complete(tenantId, id, input = {}) {
      return this.update(tenantId, id, { status: 'completed', completedDate: input.completedDate || new Date().toISOString().slice(0, 10), notes: input.notes || '' });
    }
  };
}

module.exports = { createInventoryTransferRepository };
