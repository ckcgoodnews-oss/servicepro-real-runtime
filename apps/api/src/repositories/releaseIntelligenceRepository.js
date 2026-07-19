'use strict';

class ReleaseIntelligenceRepository {
  constructor(store) {
    this.store = store;
  }

  async saveRiskEvaluation(result, input) {
    return this.store.query(
      `insert into release_risk_evaluations
       (release_id, risk_score, risk_level, blocked, factors,
        recommendations, input_data, evaluated_at)
       values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8)
       returning *`,
      [
        input.releaseId || null,
        result.score,
        result.level,
        result.blocked === true,
        JSON.stringify(result.factors),
        JSON.stringify(result.recommendations),
        JSON.stringify(input),
        result.evaluatedAt,
      ],
    );
  }

  async saveOptimizationReport(report) {
    return this.store.query(
      `insert into deployment_optimization_reports
       (metrics, strategy_performance, preferred_strategy,
        recommendations, generated_at)
       values ($1::jsonb,$2::jsonb,$3::jsonb,$4::jsonb,$5)
       returning *`,
      [
        JSON.stringify(report.metrics),
        JSON.stringify(report.strategyPerformance),
        JSON.stringify(report.preferredStrategy),
        JSON.stringify(report.recommendations),
        report.generatedAt,
      ],
    );
  }
}

module.exports = {
  ReleaseIntelligenceRepository,
};
