const { makeId, now } = require('../services/id');
const { normalizeAttachmentInput, publicAttachmentMetadata } = require('../services/mediaService');

function createMediaAttachmentRepository(store) {
  if (store.type === 'json') return createJsonMediaAttachmentRepository(store);
  if (store.type === 'postgres') return createPostgresMediaAttachmentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureMedia(data) {
  if (!data.mediaAttachments) data.mediaAttachments = [];
  return data;
}

function createJsonMediaAttachmentRepository(store) {
  return {
    list(tenantId, filters = {}) {
      return ensureMedia(store.read()).mediaAttachments
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.entityType || x.entityType === filters.entityType)
        .filter(x => !filters.entityId || x.entityId === filters.entityId)
        .map(publicAttachmentMetadata);
    },
    findById(tenantId, id) {
      const attachment = ensureMedia(store.read()).mediaAttachments.find(x => x.tenantId === tenantId && x.id === id);
      return attachment ? publicAttachmentMetadata(attachment) : null;
    },
    create(tenantId, input) {
      const data = ensureMedia(store.read());
      const attachment = {
        id: makeId('media'),
        tenantId,
        ...normalizeAttachmentInput(input, tenantId),
        createdAt: now(),
        updatedAt: now()
      };
      data.mediaAttachments.push(attachment);
      store.write(data);
      return publicAttachmentMetadata(attachment);
    },
    update(tenantId, id, input) {
      const data = ensureMedia(store.read());
      const idx = data.mediaAttachments.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.mediaAttachments[idx] = {
        ...data.mediaAttachments[idx],
        caption: input.caption !== undefined ? input.caption : data.mediaAttachments[idx].caption,
        description: input.description !== undefined ? input.description : data.mediaAttachments[idx].description,
        visibility: input.visibility || data.mediaAttachments[idx].visibility,
        tags: Array.isArray(input.tags) ? input.tags : data.mediaAttachments[idx].tags,
        metadata: input.metadata || data.mediaAttachments[idx].metadata,
        updatedAt: now()
      };
      store.write(data);
      return publicAttachmentMetadata(data.mediaAttachments[idx]);
    },
    remove(tenantId, id) {
      const data = ensureMedia(store.read());
      const before = data.mediaAttachments.length;
      data.mediaAttachments = data.mediaAttachments.filter(x => !(x.tenantId === tenantId && x.id === id));
      store.write(data);
      return data.mediaAttachments.length !== before;
    }
  };
}

function createPostgresMediaAttachmentRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", entity_type as "entityType",
    entity_id as "entityId", filename, original_filename as "originalFilename", mime_type as "mimeType",
    media_kind as "mediaKind", size_bytes as "sizeBytes", storage_provider as "storageProvider",
    storage_key as "storageKey", checksum_sha256 as "checksumSha256", caption, description, visibility,
    tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    FROM media_attachments`;

  function toPublic(row) {
    return publicAttachmentMetadata(row);
  }

  return {
    async list(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.entityType) {
        params.push(filters.entityType);
        where += ` AND entity_type = $${params.length}`;
      }
      if (filters.entityId) {
        params.push(filters.entityId);
        where += ` AND entity_id = $${params.length}`;
      }
      const result = await store.query(`${selectSql} ${where} ORDER BY created_at DESC`, params);
      return result.rows.map(toPublic);
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] ? toPublic(result.rows[0]) : null;
    },
    async create(tenantId, input) {
      const x = normalizeAttachmentInput(input, tenantId);
      const result = await store.query(
        `INSERT INTO media_attachments
         (tenant_id, entity_type, entity_id, filename, original_filename, mime_type, media_kind, size_bytes,
          storage_provider, storage_key, checksum_sha256, caption, description, visibility, tags, metadata, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17)
         RETURNING id::text, tenant_id as "tenantId", entity_type as "entityType",
                   entity_id as "entityId", filename, original_filename as "originalFilename", mime_type as "mimeType",
                   media_kind as "mediaKind", size_bytes as "sizeBytes", storage_provider as "storageProvider",
                   storage_key as "storageKey", checksum_sha256 as "checksumSha256", caption, description, visibility,
                   tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.entityType, x.entityId, x.filename, x.originalFilename, x.mimeType, x.mediaKind, x.sizeBytes,
          x.storageProvider, x.storageKey, x.checksumSha256, x.caption, x.description, x.visibility,
          JSON.stringify(x.tags || []), JSON.stringify(x.metadata || {}), x.createdBy]
      );
      return toPublic(result.rows[0]);
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const result = await store.query(
        `UPDATE media_attachments
         SET caption=$3, description=$4, visibility=$5, tags=$6::jsonb, metadata=$7::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", entity_type as "entityType",
                   entity_id as "entityId", filename, original_filename as "originalFilename", mime_type as "mimeType",
                   media_kind as "mediaKind", size_bytes as "sizeBytes", storage_provider as "storageProvider",
                   storage_key as "storageKey", checksum_sha256 as "checksumSha256", caption, description, visibility,
                   tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.caption !== undefined ? input.caption : existing.caption, input.description !== undefined ? input.description : existing.description,
          input.visibility || existing.visibility, JSON.stringify(Array.isArray(input.tags) ? input.tags : existing.tags || []),
          JSON.stringify(input.metadata || existing.metadata || {})]
      );
      return toPublic(result.rows[0]);
    },
    async remove(tenantId, id) {
      const result = await store.query(`DELETE FROM media_attachments WHERE tenant_id = $1 AND id = $2`, [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createMediaAttachmentRepository };
