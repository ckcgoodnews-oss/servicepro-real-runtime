'use strict';

class ReleaseIntelligenceService {
  constructor({
    repository,
    riskEngine,
    optimizationEngine,
    riskPolicy,
    optimizationPolicy,
  }) {
    this.repository = repository;
    this.riskEngine = riskEngine;
    this.optimizationEngine = optimizationEngine;
    this.riskPolicy = riskPolicy;
    this.optimizationPolicy = optimizationPolicy;
  }

  async evaluateRisk(input) {
    const result = this.riskEngine.calculateReleaseRisk(
      input,
      this.riskPolicy,
    );

    const report = {
      ...result,
      blocked: this.riskEngine.shouldBlockRelease(
        result,
        this.riskPolicy,
      ),
    };

    if (this.repository) {
      await this.repository.saveRiskEvaluation(report, input);
    }

    return report;
  }

  async analyzePerformance(records) {
    const report =
      this.optimizationEngine.analyzeDeploymentPerformance(
        records,
        this.optimizationPolicy,
      );

    if (this.repository) {
      await this.repository.saveOptimizationReport(report);
    }

    return report;
  }
}

module.exports = {
  ReleaseIntelligenceService,
};
