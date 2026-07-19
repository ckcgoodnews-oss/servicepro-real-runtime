'use strict';

class ProductionReadinessService {
  constructor({
    repository,
    readinessEngine,
    securityEngine,
    readinessPolicy,
    securityPolicy,
  }) {
    this.repository = repository;
    this.readinessEngine = readinessEngine;
    this.securityEngine = securityEngine;
    this.readinessPolicy = readinessPolicy;
    this.securityPolicy = securityPolicy;
  }

  async evaluateReadiness(input) {
    const report =
      this.readinessEngine.evaluateProductionReadiness({
        ...input,
        policy: this.readinessPolicy,
      });

    if (this.repository) {
      await this.repository.saveReadinessReport(report);
    }

    return report;
  }

  async evaluateSecurity(input) {
    const report =
      this.securityEngine.evaluateSecurityHardening({
        ...input,
        policy: this.securityPolicy,
      });

    if (this.repository) {
      await this.repository.saveSecurityReport(report);
    }

    return report;
  }
}

module.exports = {
  ProductionReadinessService,
};
