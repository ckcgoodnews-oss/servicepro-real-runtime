const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const transfer = await repos.privacyDataTransfer.createTransfer({ tenantId, name: 'EU Customer Analytics Transfer', sourceCountry: 'DE', destinationCountry: 'US', exporter: 'ServicePro EU', importer: 'ServicePro US', dataCategories: ['account','usage'], subjectCategories: ['customers'], purpose: 'service analytics', mechanism: 'scc', riskLevel: 'high', owner: 'privacy' });
  const assessment = await repos.privacyDataTransfer.createAssessment({ tenantId, transferId: transfer.id, riskLevel: 'high', localLawSummary: 'Assessment completed.', supplementaryMeasures: ['encryption','access logging'] });
  await repos.privacyDataTransfer.submitAssessment(assessment.id, 'privacy');
  const approvedAssessment = await repos.privacyDataTransfer.approveAssessment(assessment.id, 'dpo', 'Approved with supplementary measures.');
  const safeguard = await repos.privacyDataTransfer.createSafeguard({ tenantId, transferId: transfer.id, name: 'SCC Module 2', safeguardType: 'contractual', documentUrl: 's3://legal/scc-module-2.pdf', owner: 'legal' });
  const activeSafeguard = await repos.privacyDataTransfer.activateSafeguard(safeguard.id);
  const approval = await repos.privacyDataTransfer.createApproval({ tenantId, transferId: transfer.id, assessmentId: assessment.id, approver: 'dpo', role: 'privacy' });
  const approvedApproval = await repos.privacyDataTransfer.approveApproval(approval.id, 'Approved.');
  const approvedTransfer = await repos.privacyDataTransfer.approveTransfer(transfer.id);
  const activeTransfer = await repos.privacyDataTransfer.activateTransfer(transfer.id);
  const metrics = await repos.privacyDataTransfer.metrics(tenantId);
  console.log(JSON.stringify({ ok: true, transfer: activeTransfer, approvedTransfer, assessment: approvedAssessment, safeguard: activeSafeguard, approval: approvedApproval, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
