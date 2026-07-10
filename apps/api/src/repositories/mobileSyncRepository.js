const { makeId, now } = require('../services/id');
const {
  normalizeDeviceInput,
  normalizeSyncCursorInput,
  normalizeOfflineChangeInput,
  detectConflict,
  buildPullPackage,
  summarizeSyncChanges
} = require('../services/mobileSyncService');

function createMobileSyncRepository(store) {
  if (store.type === 'json') return createJsonMobileSyncRepository(store);
  if (store.type === 'postgres') return createPostgresMobileSyncRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureMobileSync(data) {
  if (!data.mobileDevices) data.mobileDevices = [];
  if (!data.mobileSyncCursors) data.mobileSyncCursors = [];
  if (!data.offlineChanges) data.offlineChanges = [];
  return data;
}

function createJsonMobileSyncRepository(store) {
  return {
    listDevices(tenantId, filters = {}) {
      return ensureMobileSync(store.read()).mobileDevices
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.userId || x.userId === filters.userId)
        .filter(x => !filters.technicianId || x.technicianId === filters.technicianId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.lastSeenAt || b.createdAt).localeCompare(String(a.lastSeenAt || a.createdAt)));
    },
    findDeviceById(tenantId, id) {
      return ensureMobileSync(store.read()).mobileDevices.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    registerDevice(tenantId, input) {
      const data = ensureMobileSync(store.read());
      const device = { id: makeId('mdev'), tenantId, ...normalizeDeviceInput(input), createdAt: now(), updatedAt: now() };
      data.mobileDevices.push(device);
      data.mobileSyncCursors.push({ id: makeId('mcursor'), tenantId, ...normalizeSyncCursorInput({ deviceId: device.id }), createdAt: now(), updatedAt: now() });
      store.write(data);
      return device;
    },
    updateDeviceHeartbeat(tenantId, id, input = {}) {
      const data = ensureMobileSync(store.read());
      const idx = data.mobileDevices.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.mobileDevices[idx] = { ...data.mobileDevices[idx], appVersion: input.appVersion || data.mobileDevices[idx].appVersion, lastSeenAt: input.lastSeenAt || now(), updatedAt: now() };
      store.write(data);
      return data.mobileDevices[idx];
    },
    getCursor(tenantId, deviceId) {
      const data = ensureMobileSync(store.read());
      return data.mobileSyncCursors.find(x => x.tenantId === tenantId && x.deviceId === deviceId) || null;
    },
    updateCursor(tenantId, deviceId, input = {}) {
      const data = ensureMobileSync(store.read());
      let idx = data.mobileSyncCursors.findIndex(x => x.tenantId === tenantId && x.deviceId === deviceId);
      if (idx === -1) {
        data.mobileSyncCursors.push({ id: makeId('mcursor'), tenantId, ...normalizeSyncCursorInput({ ...input, deviceId }), createdAt: now(), updatedAt: now() });
        idx = data.mobileSyncCursors.length - 1;
      } else {
        data.mobileSyncCursors[idx] = { ...data.mobileSyncCursors[idx], ...input, deviceId, tenantId, updatedAt: now() };
      }
      store.write(data);
      return data.mobileSyncCursors[idx];
    },
    pushChanges(tenantId, input = {}) {
      const data = ensureMobileSync(store.read());
      const device = data.mobileDevices.find(x => x.tenantId === tenantId && x.id === input.deviceId);
      if (!device) return null;

      const accepted = [];
      for (const raw of input.changes || []) {
        const change = {
          id: makeId('ochg'),
          tenantId,
          ...normalizeOfflineChangeInput({ ...raw, deviceId: input.deviceId, technicianId: raw.technicianId || device.technicianId }),
          createdAt: now(),
          updatedAt: now()
        };
        const serverRecord = (input.serverRecords || {})[`${change.entityType}:${change.entityId}`] || {};
        const conflict = detectConflict(change, serverRecord);
        if (conflict.conflict) {
          change.status = 'conflict';
          change.conflictReason = conflict.reason;
        } else {
          change.status = 'applied';
          change.appliedAt = now();
          change.serverVersion = Math.max(Number(change.baseVersion || 0), Number(serverRecord.version || 0)) + 1;
        }
        data.offlineChanges.push(change);
        accepted.push(change);
      }

      const maxVersion = accepted.reduce((max, x) => Math.max(max, Number(x.serverVersion || x.clientVersion || x.baseVersion || 0)), 0);
      this.updateCursor(tenantId, input.deviceId, { lastPushedAt: now(), lastServerVersion: maxVersion });
      store.write(data);
      return { deviceId: input.deviceId, summary: summarizeSyncChanges(accepted), changes: accepted };
    },
    listChanges(tenantId, filters = {}) {
      return ensureMobileSync(store.read()).offlineChanges
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.deviceId || x.deviceId === filters.deviceId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.entityType || x.entityType === filters.entityType)
        .sort((a, b) => String(b.receivedAt || b.createdAt).localeCompare(String(a.receivedAt || a.createdAt)));
    },
    resolveConflict(tenantId, id, input = {}) {
      const data = ensureMobileSync(store.read());
      const idx = data.offlineChanges.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.offlineChanges[idx] = {
        ...data.offlineChanges[idx],
        status: input.status || 'applied',
        resolution: input.resolution || 'manual_merge',
        conflictReason: '',
        appliedAt: now(),
        updatedAt: now()
      };
      store.write(data);
      return data.offlineChanges[idx];
    },
    pullPackage(tenantId, input = {}) {
      const cursor = this.getCursor(tenantId, input.deviceId);
      const sinceVersion = input.sinceVersion !== undefined ? input.sinceVersion : (cursor ? cursor.lastServerVersion : 0);
      const pkg = buildPullPackage({ deviceId: input.deviceId, sinceVersion, entities: input.entities || {} });
      this.updateCursor(tenantId, input.deviceId, { lastPulledAt: now(), lastServerVersion: pkg.serverVersion, entityVersions: input.entityVersions || {} });
      return pkg;
    }
  };
}

function createPostgresMobileSyncRepository(store) {
  const deviceSelect = `SELECT id::text, tenant_id as "tenantId", user_id as "userId", technician_id::text as "technicianId",
    device_name as "deviceName", device_platform as "devicePlatform", app_version as "appVersion", status,
    device_token as "deviceToken", last_seen_at as "lastSeenAt", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM mobile_devices`;

  const cursorSelect = `SELECT id::text, tenant_id as "tenantId", device_id::text as "deviceId",
    last_pulled_at as "lastPulledAt", last_pushed_at as "lastPushedAt", last_server_version as "lastServerVersion",
    entity_versions as "entityVersions", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM mobile_sync_cursors`;

  const changeSelect = `SELECT id::text, tenant_id as "tenantId", device_id::text as "deviceId",
    technician_id::text as "technicianId", client_change_id as "clientChangeId", entity_type as "entityType",
    entity_id as "entityId", operation, status, base_version as "baseVersion", client_version as "clientVersion",
    server_version as "serverVersion", payload, conflict_reason as "conflictReason", resolution,
    received_at as "receivedAt", applied_at as "appliedAt", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM offline_changes`;

  return {
    async listDevices(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { userId: 'user_id', technicianId: 'technician_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${deviceSelect} ${where} ORDER BY COALESCE(last_seen_at, created_at) DESC`, params);
      return result.rows;
    },
    async findDeviceById(tenantId, id) {
      const result = await store.query(`${deviceSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async registerDevice(tenantId, input) {
      const x = normalizeDeviceInput(input);
      const result = await store.query(
        `INSERT INTO mobile_devices
         (tenant_id, user_id, technician_id, device_name, device_platform, app_version, status, device_token, last_seen_at, metadata)
         VALUES ($1,$2,NULLIF($3,'')::uuid,$4,$5,$6,$7,$8,NULLIF($9,'')::timestamptz,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", user_id as "userId", technician_id::text as "technicianId",
                   device_name as "deviceName", device_platform as "devicePlatform", app_version as "appVersion", status,
                   device_token as "deviceToken", last_seen_at as "lastSeenAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.userId, x.technicianId, x.deviceName, x.devicePlatform, x.appVersion, x.status, x.deviceToken, x.lastSeenAt, JSON.stringify(x.metadata || {})]
      );
      const device = result.rows[0];
      await this.updateCursor(tenantId, device.id, {});
      return device;
    },
    async updateDeviceHeartbeat(tenantId, id, input = {}) {
      const result = await store.query(
        `UPDATE mobile_devices SET app_version=COALESCE(NULLIF($3,''), app_version), last_seen_at=$4::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", user_id as "userId", technician_id::text as "technicianId",
                   device_name as "deviceName", device_platform as "devicePlatform", app_version as "appVersion", status,
                   device_token as "deviceToken", last_seen_at as "lastSeenAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.appVersion || '', input.lastSeenAt || new Date().toISOString()]
      );
      return result.rows[0] || null;
    },
    async getCursor(tenantId, deviceId) {
      const result = await store.query(`${cursorSelect} WHERE tenant_id = $1 AND device_id = $2 LIMIT 1`, [tenantId, deviceId]);
      return result.rows[0] || null;
    },
    async updateCursor(tenantId, deviceId, input = {}) {
      const existing = await this.getCursor(tenantId, deviceId);
      if (!existing) {
        const x = normalizeSyncCursorInput({ ...input, deviceId });
        const result = await store.query(
          `INSERT INTO mobile_sync_cursors
           (tenant_id, device_id, last_pulled_at, last_pushed_at, last_server_version, entity_versions, metadata)
           VALUES ($1,$2::uuid,NULLIF($3,'')::timestamptz,NULLIF($4,'')::timestamptz,$5,$6::jsonb,$7::jsonb)
           RETURNING id::text, tenant_id as "tenantId", device_id::text as "deviceId",
                     last_pulled_at as "lastPulledAt", last_pushed_at as "lastPushedAt", last_server_version as "lastServerVersion",
                     entity_versions as "entityVersions", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
          [tenantId, deviceId, x.lastPulledAt, x.lastPushedAt, x.lastServerVersion, JSON.stringify(x.entityVersions || {}), JSON.stringify(x.metadata || {})]
        );
        return result.rows[0];
      }
      const result = await store.query(
        `UPDATE mobile_sync_cursors
         SET last_pulled_at=COALESCE(NULLIF($3,'')::timestamptz,last_pulled_at),
             last_pushed_at=COALESCE(NULLIF($4,'')::timestamptz,last_pushed_at),
             last_server_version=GREATEST(last_server_version,$5),
             entity_versions=$6::jsonb,
             metadata=$7::jsonb,
             updated_at=now()
         WHERE tenant_id=$1 AND device_id=$2
         RETURNING id::text, tenant_id as "tenantId", device_id::text as "deviceId",
                   last_pulled_at as "lastPulledAt", last_pushed_at as "lastPushedAt", last_server_version as "lastServerVersion",
                   entity_versions as "entityVersions", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, deviceId, input.lastPulledAt || '', input.lastPushedAt || '', Number(input.lastServerVersion || 0),
          JSON.stringify(input.entityVersions || existing.entityVersions || {}), JSON.stringify(input.metadata || existing.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async pushChanges(tenantId, input = {}) {
      const device = await this.findDeviceById(tenantId, input.deviceId);
      if (!device) return null;

      const accepted = [];
      for (const raw of input.changes || []) {
        const x = normalizeOfflineChangeInput({ ...raw, deviceId: input.deviceId, technicianId: raw.technicianId || device.technicianId });
        const serverRecord = (input.serverRecords || {})[`${x.entityType}:${x.entityId}`] || {};
        const conflict = detectConflict(x, serverRecord);
        const status = conflict.conflict ? 'conflict' : 'applied';
        const serverVersion = conflict.conflict ? Number(x.serverVersion || 0) : Math.max(Number(x.baseVersion || 0), Number(serverRecord.version || 0)) + 1;
        const appliedAt = conflict.conflict ? '' : new Date().toISOString();

        const result = await store.query(
          `INSERT INTO offline_changes
           (tenant_id, device_id, technician_id, client_change_id, entity_type, entity_id, operation, status,
            base_version, client_version, server_version, payload, conflict_reason, resolution, received_at, applied_at, metadata)
           VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15::timestamptz,NULLIF($16,'')::timestamptz,$17::jsonb)
           RETURNING id::text, tenant_id as "tenantId", device_id::text as "deviceId",
                     technician_id::text as "technicianId", client_change_id as "clientChangeId", entity_type as "entityType",
                     entity_id as "entityId", operation, status, base_version as "baseVersion", client_version as "clientVersion",
                     server_version as "serverVersion", payload, conflict_reason as "conflictReason", resolution,
                     received_at as "receivedAt", applied_at as "appliedAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
          [tenantId, x.deviceId, x.technicianId, x.clientChangeId, x.entityType, x.entityId, x.operation, status,
            x.baseVersion, x.clientVersion, serverVersion, JSON.stringify(x.payload || {}), conflict.conflict ? conflict.reason : '',
            x.resolution, x.receivedAt, appliedAt, JSON.stringify(x.metadata || {})]
        );
        accepted.push(result.rows[0]);
      }

      const maxVersion = accepted.reduce((max, x) => Math.max(max, Number(x.serverVersion || x.clientVersion || x.baseVersion || 0)), 0);
      await this.updateCursor(tenantId, input.deviceId, { lastPushedAt: new Date().toISOString(), lastServerVersion: maxVersion });
      return { deviceId: input.deviceId, summary: summarizeSyncChanges(accepted), changes: accepted };
    },
    async listChanges(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { deviceId: 'device_id', status: 'status', entityType: 'entity_type' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${changeSelect} ${where} ORDER BY COALESCE(received_at, created_at) DESC`, params);
      return result.rows;
    },
    async resolveConflict(tenantId, id, input = {}) {
      const result = await store.query(
        `UPDATE offline_changes
         SET status=$3, resolution=$4, conflict_reason='', applied_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", device_id::text as "deviceId",
                   technician_id::text as "technicianId", client_change_id as "clientChangeId", entity_type as "entityType",
                   entity_id as "entityId", operation, status, base_version as "baseVersion", client_version as "clientVersion",
                   server_version as "serverVersion", payload, conflict_reason as "conflictReason", resolution,
                   received_at as "receivedAt", applied_at as "appliedAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.status || 'applied', input.resolution || 'manual_merge']
      );
      return result.rows[0] || null;
    },
    async pullPackage(tenantId, input = {}) {
      const cursor = await this.getCursor(tenantId, input.deviceId);
      const sinceVersion = input.sinceVersion !== undefined ? input.sinceVersion : (cursor ? cursor.lastServerVersion : 0);
      const pkg = buildPullPackage({ deviceId: input.deviceId, sinceVersion, entities: input.entities || {} });
      await this.updateCursor(tenantId, input.deviceId, { lastPulledAt: new Date().toISOString(), lastServerVersion: pkg.serverVersion, entityVersions: input.entityVersions || {} });
      return pkg;
    }
  };
}

module.exports = { createMobileSyncRepository };
