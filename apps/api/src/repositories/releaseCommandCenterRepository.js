'use strict';

class ReleaseCommandCenterRepository {
  constructor(store) {
    this.store = store;
  }

  async getEnvironmentStatuses() {
    return this.store.query(
      `select *
       from release_command_center_environment_status
       order by environment_name`,
    );
  }

  async getReleaseTimeline(limit = 100) {
    return this.store.query(
      `select *
       from release_command_center_timeline
       order by occurred_at desc
       limit $1`,
      [limit],
    );
  }

  async getAuditRecords({
    actor = null,
    action = null,
    resourceType = null,
    outcome = null,
    limit = 100,
  } = {}) {
    return this.store.query(
      `select *
       from release_command_center_audit
       where ($1::text is null or actor = $1)
         and ($2::text is null or action = $2)
         and ($3::text is null or resource_type = $3)
         and ($4::text is null or outcome = $4)
       order by occurred_at desc
       limit $5`,
      [
        actor,
        action,
        resourceType,
        outcome,
        limit,
      ],
    );
  }

  async saveAuditRecord(record) {
    return this.store.query(
      `insert into release_command_center_audit
       (audit_hash, actor, action, resource_type, resource_id,
        outcome, details, occurred_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       returning *`,
      [
        record.auditHash,
        record.actor,
        record.action,
        record.resourceType,
        record.resourceId,
        record.outcome,
        JSON.stringify(record.details),
        record.occurredAt,
      ],
    );
  }
}

module.exports = {
  ReleaseCommandCenterRepository,
};
