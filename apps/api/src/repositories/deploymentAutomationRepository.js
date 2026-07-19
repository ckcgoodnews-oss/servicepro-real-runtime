'use strict';

class DeploymentAutomationRepository {
  constructor(store) {
    this.store = store;
  }

  async saveRollout(rollout) {
    return this.store.query(
      `insert into release_rollouts
       (rollout_id, release_id, strategy, target_environment, state,
        current_step_index, plan, history, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)
       on conflict (rollout_id) do update set
         state = excluded.state,
         current_step_index = excluded.current_step_index,
         history = excluded.history,
         updated_at = excluded.updated_at
       returning *`,
      [
        rollout.rolloutId,
        rollout.releaseId,
        rollout.strategy,
        rollout.targetEnvironment,
        rollout.state,
        rollout.currentStepIndex,
        JSON.stringify(rollout.steps),
        JSON.stringify(rollout.history),
        rollout.createdAt,
        rollout.updatedAt,
      ],
    );
  }

  async saveRollbackAuthorization(authorization) {
    return this.store.query(
      `insert into release_rollback_authorizations
       (rollback_id, release_id, previous_release_id, change_ticket,
        operator_identity, trigger_reasons, authorized_at)
       values ($1,$2,$3,$4,$5,$6::jsonb,$7)
       returning *`,
      [
        authorization.rollbackId,
        authorization.releaseId,
        authorization.previousReleaseId,
        authorization.changeTicket,
        authorization.operator,
        JSON.stringify(authorization.triggerReasons),
        authorization.authorizedAt,
      ],
    );
  }
}

module.exports = {
  DeploymentAutomationRepository,
};
