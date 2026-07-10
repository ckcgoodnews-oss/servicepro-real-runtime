const { makeId, now } = require('../services/id');
const { normalizePurchaseOrderInput, applyReceivingToLines, calculateReceivedStatus, calculatePurchaseOrderSubtotal } = require('../services/purchasingService');

function createPurchaseOrderRepository(store) {
  if (store.type === 'json') return createJsonPurchaseOrderRepository(store);
  if (store.type === 'postgres') return createPostgresPurchaseOrderRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePurchaseOrders(data) {
  if (!data.purchaseOrders) data.purchaseOrders = [];
  if (!data.purchaseReceipts) data.purchaseReceipts = [];
  return data;
}

function createJsonPurchaseOrderRepository(store) {
  return {
    list(tenantId) {
      return ensurePurchaseOrders(store.read()).purchaseOrders.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return this.list(tenantId).find(x => x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensurePurchaseOrders(store.read());
      const po = { id: makeId('po'), tenantId, purchaseOrderNumber: input.purchaseOrderNumber || makeId('PO'), ...normalizePurchaseOrderInput(input), createdAt: now(), updatedAt: now() };
      data.purchaseOrders.push(po);
      store.write(data);
      return po;
    },
    update(tenantId, id, input) {
      const data = ensurePurchaseOrders(store.read());
      const idx = data.purchaseOrders.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      const next = { ...data.purchaseOrders[idx], ...input, id, tenantId, updatedAt: now() };
      if (input.lines) {
        next.subtotal = calculatePurchaseOrderSubtotal(input.lines);
        next.total = next.subtotal;
      }
      data.purchaseOrders[idx] = next;
      store.write(data);
      return next;
    },
    receive(tenantId, id, input) {
      const data = ensurePurchaseOrders(store.read());
      const idx = data.purchaseOrders.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      const receivedLines = Array.isArray(input.lines) ? input.lines : [];
      const lines = applyReceivingToLines(data.purchaseOrders[idx].lines || [], receivedLines);
      const status = calculateReceivedStatus(lines);
      data.purchaseOrders[idx] = { ...data.purchaseOrders[idx], lines, status, receivedDate: status === 'received' ? (input.receivedDate || new Date().toISOString().slice(0, 10)) : data.purchaseOrders[idx].receivedDate, updatedAt: now() };
      const receipt = { id: makeId('receipt'), tenantId, purchaseOrderId: id, receivedDate: input.receivedDate || new Date().toISOString().slice(0, 10), lines: receivedLines, notes: input.notes || '', createdAt: now() };
      data.purchaseReceipts.push(receipt);
      store.write(data);
      return { purchaseOrder: data.purchaseOrders[idx], receipt };
    },
    receipts(tenantId, purchaseOrderId) {
      return ensurePurchaseOrders(store.read()).purchaseReceipts.filter(x => x.tenantId === tenantId && x.purchaseOrderId === purchaseOrderId);
    }
  };
}

function createPostgresPurchaseOrderRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", purchase_order_number as "purchaseOrderNumber",
    vendor_id::text as "vendorId", status, order_date as "orderDate", expected_date as "expectedDate",
    received_date as "receivedDate", vendor_reference as "vendorReference", notes, lines, subtotal::float,
    total::float, created_at as "createdAt", updated_at as "updatedAt" FROM purchase_orders`;
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
      const x = normalizePurchaseOrderInput(input);
      const poNumber = input.purchaseOrderNumber || `PO-${Date.now()}`;
      const result = await store.query(
        `INSERT INTO purchase_orders
         (tenant_id, purchase_order_number, vendor_id, status, order_date, expected_date, received_date, vendor_reference, notes, lines, subtotal, total)
         VALUES ($1,$2,$3::uuid,$4,$5::date,NULLIF($6,'')::date,NULLIF($7,'')::date,$8,$9,$10::jsonb,$11,$12)
         RETURNING id::text, tenant_id as "tenantId", purchase_order_number as "purchaseOrderNumber",
                   vendor_id::text as "vendorId", status, order_date as "orderDate", expected_date as "expectedDate",
                   received_date as "receivedDate", vendor_reference as "vendorReference", notes, lines, subtotal::float,
                   total::float, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, poNumber, x.vendorId, x.status, x.orderDate, x.expectedDate, x.receivedDate, x.vendorReference, x.notes, JSON.stringify(x.lines), x.subtotal, x.total]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const lines = input.lines || existing.lines || [];
      const subtotal = calculatePurchaseOrderSubtotal(lines);
      const result = await store.query(
        `UPDATE purchase_orders SET status=$3, expected_date=NULLIF($4,'')::date, received_date=NULLIF($5,'')::date,
         vendor_reference=$6, notes=$7, lines=$8::jsonb, subtotal=$9, total=$10, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", purchase_order_number as "purchaseOrderNumber",
                   vendor_id::text as "vendorId", status, order_date as "orderDate", expected_date as "expectedDate",
                   received_date as "receivedDate", vendor_reference as "vendorReference", notes, lines, subtotal::float,
                   total::float, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.status || 'draft', x.expectedDate || '', x.receivedDate || '', x.vendorReference || '', x.notes || '', JSON.stringify(lines), subtotal, subtotal]
      );
      return result.rows[0] || null;
    },
    async receive(tenantId, id, input) {
      const po = await this.findById(tenantId, id);
      if (!po) return null;
      const receivedLines = Array.isArray(input.lines) ? input.lines : [];
      const lines = applyReceivingToLines(po.lines || [], receivedLines);
      const status = calculateReceivedStatus(lines);
      const updated = await this.update(tenantId, id, { lines, status, receivedDate: status === 'received' ? (input.receivedDate || new Date().toISOString().slice(0, 10)) : (po.receivedDate || '') });
      const result = await store.query(
        `INSERT INTO purchase_receipts (tenant_id, purchase_order_id, received_date, lines, notes)
         VALUES ($1,$2::uuid,$3::date,$4::jsonb,$5)
         RETURNING id::text, tenant_id as "tenantId", purchase_order_id::text as "purchaseOrderId",
                   received_date as "receivedDate", lines, notes, created_at as "createdAt"`,
        [tenantId, id, input.receivedDate || new Date().toISOString().slice(0, 10), JSON.stringify(receivedLines), input.notes || '']
      );
      return { purchaseOrder: updated, receipt: result.rows[0] };
    },
    async receipts(tenantId, purchaseOrderId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", purchase_order_id::text as "purchaseOrderId",
                received_date as "receivedDate", lines, notes, created_at as "createdAt"
         FROM purchase_receipts WHERE tenant_id = $1 AND purchase_order_id = $2 ORDER BY created_at DESC`,
        [tenantId, purchaseOrderId]
      );
      return result.rows;
    }
  };
}

module.exports = { createPurchaseOrderRepository };
