const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const system = await repos.aiGovernance.createSystem({
    tenantId,
    name: 'Support Ticket Triage Assistant',
    systemType: 'generative_ai',
    owner: 'platform',
    businessUnit: 'support',
    vendorName: 'internal',
    modelName: 'servicepro-triage',
    modelVersion: '2026.07',
    useCase: 'Summarize support tickets and suggest routing queues.',
    dataCategories: ['contact', 'service_records'],
    userImpact: 'Operational routing support only'
  });

  const assessment = await repos.aiGovernance.createAssessment({
    aiSystemId: system.id,
    tenantId,
    assessor: 'ai-governance',
    biasRisk: 'medium',
    privacyRisk: 'medium',
    securityRisk: 'medium',
    explainabilityNotes: 'Human reviewer sees routing reason and source ticket context.',
    humanOversight: true,
    mitigationPlan: 'Require human approval before customer-facing actions.'
  });

  const submitted = await repos.aiGovernance.submitAssessment(assessment.id, 'ai-governance');

  const approval = await repos.aiGovernance.createApproval({
    assessmentId: assessment.id,
    aiSystemId: system.id,
    tenantId,
    approverId: 'risk-lead',
    approverName: 'Risk Lead'
  });
  const approvedGate = await repos.aiGovernance.approveGate(approval.id, 'Approved for controlled pilot.');

  const approvedAssessment = await repos.aiGovernance.approveAssessment(assessment.id);
  const activatedSystem = await repos.aiGovernance.activateSystem(system.id);

  const signal = await repos.aiGovernance.createSignal({
    aiSystemId: system.id,
    tenantId,
    signalName: 'Human override rate',
    numericValue: 18,
    warningThreshold: 15,
    breachThreshold: 30,
    operator: 'gte'
  });

  const incident = await repos.aiGovernance.createIncident({
    aiSystemId: system.id,
    tenantId,
    title: 'Incorrect queue recommendation',
    severity: 'medium',
    reportedBy: 'support-lead',
    description: 'Pilot model recommended the wrong routing queue for a specialized case.'
  });
  const mitigatedIncident = await repos.aiGovernance.mitigateIncident(incident.id);
  const reviewedSystem = await repos.aiGovernance.reviewSystem(system.id);
  const metrics = await repos.aiGovernance.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({
    ok: true,
    system: reviewedSystem,
    activatedSystem,
    assessment: approvedAssessment,
    submitted,
    approval: approvedGate,
    signal,
    incident: mitigatedIncident,
    metrics
  }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
