'use strict';

function evaluateCheck(check) {
  const passed = check.required !== true || check.status === 'passed';

  return {
    id: check.id,
    category: check.category,
    required: check.required === true,
    status: check.status,
    passed,
    evidence: check.evidence || null,
    message: check.message || null,
  };
}

function evaluateProductionReadiness({
  releaseId,
  checks = [],
  approvals = [],
  policy,
}) {
  const evaluatedChecks = checks.map(evaluateCheck);
  const failedRequiredChecks = evaluatedChecks.filter(
    (check) => check.required && !check.passed,
  );

  const approvalRoles = new Set(
    approvals
      .filter((approval) => approval.approved === true)
      .map((approval) => String(approval.role || '').toLowerCase()),
  );

  const missingApprovals = (policy.requiredApprovalRoles || []).filter(
    (role) => !approvalRoles.has(String(role).toLowerCase()),
  );

  const categorySummary = {};
  for (const check of evaluatedChecks) {
    const current = categorySummary[check.category] || {
      total: 0,
      passed: 0,
      failed: 0,
    };

    current.total += 1;
    if (check.passed) {
      current.passed += 1;
    } else {
      current.failed += 1;
    }

    categorySummary[check.category] = current;
  }

  const ready =
    failedRequiredChecks.length === 0 &&
    missingApprovals.length === 0;

  return {
    schemaVersion: 1,
    phase: 70,
    sprint: 771,
    control: 'production-readiness-certification',
    releaseId,
    evaluatedAt: new Date().toISOString(),
    ready,
    categorySummary,
    failedRequiredChecks,
    missingApprovals,
    certificate: ready
      ? {
          releaseId,
          certifiedAt: new Date().toISOString(),
          approvalRoles: [...approvalRoles],
          requiredCheckCount: evaluatedChecks.filter(
            (check) => check.required,
          ).length,
        }
      : null,
  };
}

module.exports = {
  evaluateCheck,
  evaluateProductionReadiness,
};
