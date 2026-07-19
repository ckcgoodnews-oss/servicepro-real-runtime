'use strict';

class ReleasePolicyOptimizationRepository {
  constructor(store) {
    this.store = store;
  }

  async saveSimulation(report, input) {
    return this.store.query(
      `insert into release_policy_simulations
       (release_id, baseline, scenarios, input_data, simulated_at)
       values ($1,$2::jsonb,$3::jsonb,$4::jsonb,$5)
       returning *`,
      [
        input.release?.releaseId || null,
        JSON.stringify(report.baseline),
        JSON.stringify(report.results),
        JSON.stringify(input),
        report.simulatedAt,
      ],
    );
  }

  async saveOptimization(report) {
    return this.store.query(
      `insert into cd_control_optimization_reports
       (metrics, recommendations, generated_at)
       values ($1::jsonb,$2::jsonb,$3)
       returning *`,
      [
        JSON.stringify(report.metrics),
        JSON.stringify(report.recommendations),
        report.generatedAt,
      ],
    );
  }
}

module.exports = {
  ReleasePolicyOptimizationRepository,
};
