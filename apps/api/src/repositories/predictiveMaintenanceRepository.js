const { makeId, now } = require('../services/id');
const {
  normalizePredictiveModelInput,
  scoreAssetRisk,
  recommendMaintenanceActions,
  normalizePredictionSnapshotInput
} = require('../services/predictiveMaintenanceService');

function createPredictiveMaintenanceRepository(store) {
  if (store.type === 'json') return createJsonPredictiveMaintenanceRepository(store);
  if (store.type === 'postgres') return createPostgresPredictiveMaintenanceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePredictive(data) {
  if (!data.predictiveModels) data.predictiveModels = [];
  if (!data.assetPredictions) data.assetPredictions = [];
  return data;
}

function createJsonPredictiveMaintenanceRepository(store) {
  return {
    listModels(tenantId) {
      return ensurePredictive(store.read()).predictiveModels.filter(x => x.tenantId === tenantId).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    findModelById(tenantId, id) {
      return this.listModels(tenantId).find(x => x.id === id) || null;
    },
    createModel(tenantId, input) {
      const data = ensurePredictive(store.read());
      const model = { id: makeId('pmmodel'), tenantId, ...normalizePredictiveModelInput(input), createdAt: now(), updatedAt: now() };
      data.predictiveModels.push(model);
      store.write(data);
      return model;
    },
    generatePrediction(tenantId, input) {
      const data = ensurePredictive(store.read());
      const model = input.modelId
        ? data.predictiveModels.find(x => x.tenantId === tenantId && x.id === input.modelId)
        : data.predictiveModels.find(x => x.tenantId === tenantId && x.status === 'active' && (!x.equipmentType || x.equipmentType === input.equipmentType));

      const scored = scoreAssetRisk(input.asset || input, model || {});
      const recommendedActions = recommendMaintenanceActions(scored);
      const snapshot = {
        id: makeId('pmpred'),
        tenantId,
        ...normalizePredictionSnapshotInput({
          ...scored,
          modelId: model ? model.id : '',
          recommendedActions,
          metadata: input.metadata || {}
        }),
        createdAt: now(),
        updatedAt: now()
      };
      data.assetPredictions.push(snapshot);
      store.write(data);
      return snapshot;
    },
    listPredictions(tenantId, filters = {}) {
      return ensurePredictive(store.read()).assetPredictions
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.assetId || x.assetId === filters.assetId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.riskBand || x.riskBand === filters.riskBand)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)));
    },
    findPredictionById(tenantId, id) {
      return ensurePredictive(store.read()).assetPredictions.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    markConverted(tenantId, id, input = {}) {
      const data = ensurePredictive(store.read());
      const idx = data.assetPredictions.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.assetPredictions[idx] = {
        ...data.assetPredictions[idx],
        status: 'converted_to_work_order',
        convertedJobId: input.convertedJobId || '',
        updatedAt: now()
      };
      store.write(data);
      return data.assetPredictions[idx];
    },
    dismiss(tenantId, id, input = {}) {
      const data = ensurePredictive(store.read());
      const idx = data.assetPredictions.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.assetPredictions[idx] = {
        ...data.assetPredictions[idx],
        status: 'dismissed',
        dismissedReason: input.dismissedReason || 'Dismissed',
        updatedAt: now()
      };
      store.write(data);
      return data.assetPredictions[idx];
    }
  };
}

function createPostgresPredictiveMaintenanceRepository(store) {
  const modelSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    equipment_type as "equipmentType", status, weights, risk_thresholds as "riskThresholds",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM predictive_models`;

  const predictionSelect = `SELECT id::text, tenant_id as "tenantId", model_id::text as "modelId",
    asset_id::text as "assetId", customer_id::text as "customerId", equipment_type as "equipmentType",
    risk_score::float as "riskScore", risk_band as "riskBand",
    failure_probability_percent::float as "failureProbabilityPercent", drivers, factors,
    recommended_actions as "recommendedActions", status, generated_at as "generatedAt",
    converted_job_id::text as "convertedJobId", dismissed_reason as "dismissedReason",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM asset_predictions`;

  return {
    async listModels(tenantId) {
      const result = await store.query(`${modelSelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findModelById(tenantId, id) {
      const result = await store.query(`${modelSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createModel(tenantId, input) {
      const x = normalizePredictiveModelInput(input);
      const result = await store.query(
        `INSERT INTO predictive_models
         (tenant_id, code, name, description, equipment_type, status, weights, risk_thresholds, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   equipment_type as "equipmentType", status, weights, risk_thresholds as "riskThresholds",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.equipmentType, x.status, JSON.stringify(x.weights || {}),
          JSON.stringify(x.riskThresholds || {}), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async generatePrediction(tenantId, input) {
      let model = null;
      if (input.modelId) {
        model = await this.findModelById(tenantId, input.modelId);
      } else {
        const models = await this.listModels(tenantId);
        model = models.find(x => x.status === 'active' && (!x.equipmentType || x.equipmentType === input.equipmentType)) || null;
      }

      const scored = scoreAssetRisk(input.asset || input, model || {});
      const recommendedActions = recommendMaintenanceActions(scored);
      const x = normalizePredictionSnapshotInput({
        ...scored,
        modelId: model ? model.id : '',
        recommendedActions,
        metadata: input.metadata || {}
      });

      const result = await store.query(
        `INSERT INTO asset_predictions
         (tenant_id, model_id, asset_id, customer_id, equipment_type, risk_score, risk_band,
          failure_probability_percent, drivers, factors, recommended_actions, status, generated_at,
          converted_job_id, dismissed_reason, metadata)
         VALUES ($1,NULLIF($2,'')::uuid,$3::uuid,NULLIF($4,'')::uuid,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13::timestamptz,
                 NULLIF($14,'')::uuid,$15,$16::jsonb)
         RETURNING id::text, tenant_id as "tenantId", model_id::text as "modelId",
                   asset_id::text as "assetId", customer_id::text as "customerId", equipment_type as "equipmentType",
                   risk_score::float as "riskScore", risk_band as "riskBand",
                   failure_probability_percent::float as "failureProbabilityPercent", drivers, factors,
                   recommended_actions as "recommendedActions", status, generated_at as "generatedAt",
                   converted_job_id::text as "convertedJobId", dismissed_reason as "dismissedReason",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.modelId, x.assetId, x.customerId, x.equipmentType, x.riskScore, x.riskBand,
          x.failureProbabilityPercent, JSON.stringify(x.drivers || []), JSON.stringify(x.factors || {}),
          JSON.stringify(x.recommendedActions || []), x.status, x.generatedAt, x.convertedJobId,
          x.dismissedReason, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listPredictions(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { assetId: 'asset_id', customerId: 'customer_id', riskBand: 'risk_band', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${predictionSelect} ${where} ORDER BY generated_at DESC`, params);
      return result.rows;
    },
    async findPredictionById(tenantId, id) {
      const result = await store.query(`${predictionSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async markConverted(tenantId, id, input = {}) {
      const result = await store.query(
        `UPDATE asset_predictions SET status='converted_to_work_order', converted_job_id=NULLIF($3,'')::uuid, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", model_id::text as "modelId",
                   asset_id::text as "assetId", customer_id::text as "customerId", equipment_type as "equipmentType",
                   risk_score::float as "riskScore", risk_band as "riskBand",
                   failure_probability_percent::float as "failureProbabilityPercent", drivers, factors,
                   recommended_actions as "recommendedActions", status, generated_at as "generatedAt",
                   converted_job_id::text as "convertedJobId", dismissed_reason as "dismissedReason",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.convertedJobId || '']
      );
      return result.rows[0] || null;
    },
    async dismiss(tenantId, id, input = {}) {
      const result = await store.query(
        `UPDATE asset_predictions SET status='dismissed', dismissed_reason=$3, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", model_id::text as "modelId",
                   asset_id::text as "assetId", customer_id::text as "customerId", equipment_type as "equipmentType",
                   risk_score::float as "riskScore", risk_band as "riskBand",
                   failure_probability_percent::float as "failureProbabilityPercent", drivers, factors,
                   recommended_actions as "recommendedActions", status, generated_at as "generatedAt",
                   converted_job_id::text as "convertedJobId", dismissed_reason as "dismissedReason",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.dismissedReason || 'Dismissed']
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createPredictiveMaintenanceRepository };
