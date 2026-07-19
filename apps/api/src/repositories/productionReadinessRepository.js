'use strict';

class ProductionReadinessRepository {
  constructor(store) {
    this.store = store;
  }

  async saveReadinessReport(report) {
    return this.store.query(
      `insert into production_readiness_reports
       (release_id, ready, category_summary, failed_checks,
        missing_approvals, certificate, evaluated_at)
       values ($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7)
       returning *`,
      [
        report.releaseId,
        report.ready,
        JSON.stringify(report.categorySummary),
        JSON.stringify(report.failedRequiredChecks),
        JSON.stringify(report.missingApprovals),
        JSON.stringify(report.certificate),
        report.evaluatedAt,
      ],
    );
  }

  async saveSecurityReport(report) {
    return this.store.query(
      `insert into production_security_reports
       (hardened, findings, blocking_findings, evaluated_at)
       values ($1,$2::jsonb,$3::jsonb,$4)
       returning *`,
      [
        report.hardened,
        JSON.stringify(report.findings),
        JSON.stringify(report.blockingFindings),
        report.evaluatedAt,
      ],
    );
  }
}

module.exports = {
  ProductionReadinessRepository,
};
