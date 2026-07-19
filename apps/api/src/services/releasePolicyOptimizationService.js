'use strict';

class ReleasePolicyOptimizationService {
  constructor({
    repository,
    simulationEngine,
    optimizer,
    policy,
  }) {
    this.repository = repository;
    this.simulationEngine = simulationEngine;
    this.optimizer = optimizer;
    this.policy = policy;
  }

  async simulate(input) {
    const report =
      this.simulationEngine.simulatePolicyScenarios({
        basePolicy: this.policy,
        ...input,
      });

    if (this.repository) {
      await this.repository.saveSimulation(report, input);
    }

    return report;
  }

  async optimize(input) {
    const report =
      this.optimizer.buildControlRecommendations({
        ...input,
        currentPolicy: this.policy,
      });

    if (this.repository) {
      await this.repository.saveOptimization(report);
    }

    return report;
  }
}

module.exports = {
  ReleasePolicyOptimizationService,
};
