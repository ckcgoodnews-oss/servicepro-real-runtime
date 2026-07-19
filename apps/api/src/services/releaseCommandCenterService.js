'use strict';

class ReleaseCommandCenterService {
  constructor({
    repository,
    analytics,
    timeline,
    audit,
  }) {
    this.repository = repository;
    this.analytics = analytics;
    this.timeline = timeline;
    this.audit = audit;
  }

  buildDashboard(input) {
    return {
      generatedAt: new Date().toISOString(),
      summary: this.analytics.summarizeReleases(input),
      environments: this.analytics.buildEnvironmentStatus(input),
      timeline: this.timeline.buildReleaseTimeline(input),
    };
  }

  async getEnvironmentStatuses() {
    return this.repository.getEnvironmentStatuses();
  }

  async getTimeline(limit) {
    return this.repository.getReleaseTimeline(limit);
  }

  async getAuditRecords(filters) {
    return this.repository.getAuditRecords(filters);
  }

  async recordAudit(input) {
    const record = this.audit.buildAuditRecord(input);
    await this.repository.saveAuditRecord(record);
    return record;
  }
}

module.exports = {
  ReleaseCommandCenterService,
};
