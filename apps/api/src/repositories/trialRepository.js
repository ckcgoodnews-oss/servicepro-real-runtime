const crypto = require('crypto');

function createTrialRepository(store) {
  if (store.type === 'json') return createJsonTrialRepository(store);
  if (store.type === 'postgres') return createPostgresTrialRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTrials(data) {
  if (!data.trials) data.trials = [];
  if (!data.trialOnboardingSteps) data.trialOnboardingSteps = [];
  return data;
}

function createJsonTrialRepository(store) {
  return {
    async create(trial) {
      const data = ensureTrials(store.read());
      const record = { ...trial, id: trial.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      data.trials.push(record);
      store.write(data);
      return record;
    },

    async findByEmail(email) {
      const data = ensureTrials(store.read());
      return data.trials.find(t => t.email === email) || null;
    },

    async findByTenantId(tenantId) {
      const data = ensureTrials(store.read());
      return data.trials.find(t => t.tenantId === tenantId) || null;
    },

    async findByVerificationHash(hash) {
      const data = ensureTrials(store.read());
      return data.trials.find(t => t.verificationTokenHash === hash && !t.emailVerifiedAt) || null;
    },

    async update(id, fields) {
      const data = ensureTrials(store.read());
      const idx = data.trials.findIndex(t => t.id === id);
      if (idx < 0) return null;
      data.trials[idx] = { ...data.trials[idx], ...fields, updatedAt: new Date().toISOString() };
      store.write(data);
      return data.trials[idx];
    },

    async listAll(filters = {}) {
      const data = ensureTrials(store.read());
      let results = [...data.trials];
      if (filters.status) results = results.filter(t => t.status === filters.status);
      if (filters.industry) results = results.filter(t => t.industry === filters.industry);
      return results;
    },

    async getOnboardingSteps(tenantId) {
      const data = ensureTrials(store.read());
      return data.trialOnboardingSteps.filter(s => s.tenantId === tenantId);
    },

    async upsertOnboardingStep(tenantId, userId, stepKey, status) {
      const data = ensureTrials(store.read());
      const now = new Date().toISOString();
      const existing = data.trialOnboardingSteps.find(s => s.tenantId === tenantId && s.stepKey === stepKey);
      if (existing) {
        existing.status = status;
        existing.completedAt = status === 'completed' ? now : null;
        existing.updatedAt = now;
        store.write(data);
        return existing;
      }
      const record = { id: crypto.randomUUID(), tenantId, userId, stepKey, status, completedAt: status === 'completed' ? now : null, createdAt: now, updatedAt: now };
      data.trialOnboardingSteps.push(record);
      store.write(data);
      return record;
    }
  };
}

function createPostgresTrialRepository(store) {
  return {
    async create(trial) {
      const { rows } = await store.pgPool.query(
        `INSERT INTO trials (id, tenant_id, email, name, company_name, phone, country, timezone, industry, team_size, plan, status, verification_token_hash, email_verified_at, provisioned_at, started_at, expires_at, converted_at, cancelled_at, suspended_at, source, campaign, metadata, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,NOW(),NOW())
         ON CONFLICT (email) WHERE status NOT IN ('expired','cancelled') DO NOTHING
         RETURNING *`,
        [trial.id || crypto.randomUUID(), trial.tenantId, trial.email, trial.name, trial.companyName, trial.phone || '', trial.country || '', trial.timezone || '', trial.industry || '', trial.teamSize || '', trial.plan || 'professional', trial.status || 'pending_verification', trial.verificationTokenHash || '', trial.emailVerifiedAt || null, trial.provisionedAt || null, trial.startedAt || null, trial.expiresAt || null, trial.convertedAt || null, trial.cancelledAt || null, trial.suspendedAt || null, trial.source || '', trial.campaign || '', JSON.stringify(trial.metadata || {})]
      );
      return rows[0] || null;
    },

    async findByEmail(email) {
      const { rows } = await store.pgPool.query(
        'SELECT * FROM trials WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [email]
      );
      return rows[0] || null;
    },

    async findByTenantId(tenantId) {
      const { rows } = await store.pgPool.query(
        'SELECT * FROM trials WHERE tenant_id = $1 LIMIT 1', [tenantId]
      );
      return rows[0] || null;
    },

    async findByVerificationHash(hash) {
      const { rows } = await store.pgPool.query(
        'SELECT * FROM trials WHERE verification_token_hash = $1 AND email_verified_at IS NULL LIMIT 1', [hash]
      );
      return rows[0] || null;
    },

    async update(id, fields) {
      const keys = Object.keys(fields);
      if (!keys.length) return null;
      const setClauses = keys.map((k, i) => `${toSnake(k)} = $${i + 2}`);
      const values = keys.map(k => fields[k]);
      const { rows } = await store.pgPool.query(
        `UPDATE trials SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return rows[0] || null;
    },

    async listAll(filters = {}) {
      let query = 'SELECT * FROM trials';
      const conditions = [];
      const params = [];
      if (filters.status) { params.push(filters.status); conditions.push(`status = $${params.length}`); }
      if (filters.industry) { params.push(filters.industry); conditions.push(`industry = $${params.length}`); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY created_at DESC LIMIT 100';
      const { rows } = await store.pgPool.query(query, params);
      return rows;
    },

    async getOnboardingSteps(tenantId) {
      const { rows } = await store.pgPool.query(
        'SELECT * FROM trial_onboarding_steps WHERE tenant_id = $1 ORDER BY sequence', [tenantId]
      );
      return rows;
    },

    async upsertOnboardingStep(tenantId, userId, stepKey, status) {
      const now = new Date().toISOString();
      const { rows } = await store.pgPool.query(
        `INSERT INTO trial_onboarding_steps (id, tenant_id, user_id, step_key, status, completed_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (tenant_id, step_key) DO UPDATE SET status = $5, completed_at = $6, updated_at = NOW()
         RETURNING *`,
        [crypto.randomUUID(), tenantId, userId, stepKey, status, status === 'completed' ? now : null]
      );
      return rows[0];
    }
  };
}

function toSnake(str) {
  return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

module.exports = { createTrialRepository };
