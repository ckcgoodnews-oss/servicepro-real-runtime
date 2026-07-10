const { makeId, now } = require('../services/id');
const { normalizeCategoryInput, normalizeItemInput } = require('../services/priceBookService');

function createPriceBookRepository(store) {
  if (store.type === 'json') return createJsonPriceBookRepository(store);
  if (store.type === 'postgres') return createPostgresPriceBookRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePriceBook(data) {
  if (!data.priceBookCategories) data.priceBookCategories = [];
  if (!data.priceBookItems) data.priceBookItems = [];
  if (!data.priceBookPublishEvents) data.priceBookPublishEvents = [];
  return data;
}

function createJsonPriceBookRepository(store) {
  return {
    listCategories(tenantId) {
      return ensurePriceBook(store.read()).priceBookCategories.filter(x => x.tenantId === tenantId);
    },
    createCategory(tenantId, input) {
      const data = ensurePriceBook(store.read());
      const category = { id: makeId('pbcat'), tenantId, ...normalizeCategoryInput(input), createdAt: now(), updatedAt: now() };
      data.priceBookCategories.push(category);
      store.write(data);
      return category;
    },
    listItems(tenantId) {
      return ensurePriceBook(store.read()).priceBookItems.filter(x => x.tenantId === tenantId);
    },
    findItemById(tenantId, id) {
      return this.listItems(tenantId).find(x => x.id === id) || null;
    },
    createItem(tenantId, input) {
      const data = ensurePriceBook(store.read());
      const item = { id: makeId('pbitem'), tenantId, ...normalizeItemInput(input), publishedAt: '', createdAt: now(), updatedAt: now() };
      data.priceBookItems.push(item);
      store.write(data);
      return item;
    },
    updateItem(tenantId, id, input) {
      const data = ensurePriceBook(store.read());
      const idx = data.priceBookItems.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.priceBookItems[idx] = { ...data.priceBookItems[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.priceBookItems[idx];
    },
    publish(tenantId, notes = '') {
      const data = ensurePriceBook(store.read());
      const stamp = now();
      for (const item of data.priceBookItems.filter(x => x.tenantId === tenantId && x.active !== false)) {
        item.publishedAt = stamp;
        item.updatedAt = stamp;
      }
      const event = { id: makeId('pbpub'), tenantId, itemCount: data.priceBookItems.filter(x => x.tenantId === tenantId && x.active !== false).length, notes, createdAt: stamp };
      data.priceBookPublishEvents.push(event);
      store.write(data);
      return event;
    }
  };
}

function createPostgresPriceBookRepository(store) {
  return {
    async listCategories(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", code, name, description, sort_order as "sortOrder",
                active, created_at as "createdAt", updated_at as "updatedAt"
         FROM price_book_categories WHERE tenant_id = $1 ORDER BY sort_order, name`,
        [tenantId]
      );
      return result.rows;
    },
    async createCategory(tenantId, input) {
      const x = normalizeCategoryInput(input);
      const result = await store.query(
        `INSERT INTO price_book_categories (tenant_id, code, name, description, sort_order, active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   sort_order as "sortOrder", active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.sortOrder, x.active]
      );
      return result.rows[0];
    },
    async listItems(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", category_id::text as "categoryId", category_code as "categoryCode",
                code, name, description, unit, base_price::float as "basePrice",
                labor_hours::float as "laborHours", material_cost::float as "materialCost",
                unit_cost::float as "unitCost", taxable, active, tags, version,
                published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM price_book_items WHERE tenant_id = $1 ORDER BY code`,
        [tenantId]
      );
      return result.rows;
    },
    async findItemById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", category_id::text as "categoryId", category_code as "categoryCode",
                code, name, description, unit, base_price::float as "basePrice",
                labor_hours::float as "laborHours", material_cost::float as "materialCost",
                unit_cost::float as "unitCost", taxable, active, tags, version,
                published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM price_book_items WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async createItem(tenantId, input) {
      const x = normalizeItemInput(input);
      const result = await store.query(
        `INSERT INTO price_book_items
         (tenant_id, category_id, category_code, code, name, description, unit, base_price, labor_hours,
          material_cost, unit_cost, taxable, active, tags, version)
         VALUES ($1, NULLIF($2, '')::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15)
         RETURNING id::text, tenant_id as "tenantId", category_id::text as "categoryId", category_code as "categoryCode",
                   code, name, description, unit, base_price::float as "basePrice",
                   labor_hours::float as "laborHours", material_cost::float as "materialCost",
                   unit_cost::float as "unitCost", taxable, active, tags, version,
                   published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.categoryId, x.categoryCode, x.code, x.name, x.description, x.unit, x.basePrice, x.laborHours, x.materialCost, x.unitCost, x.taxable, x.active, JSON.stringify(x.tags || []), x.version]
      );
      return result.rows[0];
    },
    async updateItem(tenantId, id, input) {
      const existing = await this.findItemById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE price_book_items SET name=$3, description=$4, unit=$5, base_price=$6, labor_hours=$7,
          material_cost=$8, unit_cost=$9, taxable=$10, active=$11, tags=$12::jsonb, version=$13, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", category_id::text as "categoryId", category_code as "categoryCode",
                   code, name, description, unit, base_price::float as "basePrice",
                   labor_hours::float as "laborHours", material_cost::float as "materialCost",
                   unit_cost::float as "unitCost", taxable, active, tags, version,
                   published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.name, x.description || '', x.unit || 'each', x.basePrice || 0, x.laborHours || 0, x.materialCost || 0, x.unitCost || 0, x.taxable !== false, x.active !== false, JSON.stringify(x.tags || []), Number(x.version || 1)]
      );
      return result.rows[0] || null;
    },
    async publish(tenantId, notes = '') {
      await store.query(`UPDATE price_book_items SET published_at = now(), updated_at = now() WHERE tenant_id = $1 AND active = true`, [tenantId]);
      const count = await store.query(`SELECT count(*)::int as count FROM price_book_items WHERE tenant_id = $1 AND active = true`, [tenantId]);
      const result = await store.query(
        `INSERT INTO price_book_publish_events (tenant_id, item_count, notes)
         VALUES ($1, $2, $3)
         RETURNING id::text, tenant_id as "tenantId", item_count as "itemCount", notes, created_at as "createdAt"`,
        [tenantId, count.rows[0].count, notes]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createPriceBookRepository };
