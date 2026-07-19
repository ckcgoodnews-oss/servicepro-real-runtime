'use strict';

class DeploymentAutomationService {
  constructor({
    repository,
    rolloutEngine,
    rollbackEngine,
    rolloutThresholds,
    rollbackPolicy,
  }) {
    this.repository = repository;
    this.rolloutEngine = rolloutEngine;
    this.rollbackEngine = rollbackEngine;
    this.rolloutThresholds = rolloutThresholds;
    this.rollbackPolicy = rollbackPolicy;
  }

  async createRollout(plan) {
    const result = this.rolloutEngine.createRollout(plan);

    if (result.rollout && this.repository) {
      await this.repository.saveRollout(result.rollout);
    }

    return result;
  }

  async advanceRollout({ rollout, metrics }) {
    const updated = this.rolloutEngine.advanceRollout({
      rollout,
      metrics,
      thresholds: this.rolloutThresholds,
    });

    if (this.repository) {
      await this.repository.saveRollout(updated);
    }

    return updated;
  }

  async evaluateRollback({
    metrics,
    rolloutState,
    request,
  }) {
    const trigger = this.rollbackEngine.evaluateRollbackTrigger({
      metrics,
      policy: this.rollbackPolicy,
      rolloutState,
    });

    const decision = this.rollbackEngine.authorizeRollback({
      trigger,
      ...request,
    });

    if (decision.authorization && this.repository) {
      await this.repository.saveRollbackAuthorization(
        decision.authorization,
      );
    }

    return {
      trigger,
      decision,
    };
  }
}

module.exports = {
  DeploymentAutomationService,
};
