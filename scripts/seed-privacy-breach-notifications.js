const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const incident = await repos.privacyBreach.createIncident({
    tenantId,
    title: 'Misrouted customer export',
    severity: 'high',
    affectedSubjects: 25,
    affectedDataTypes: ['contact', 'financial'],
    systems: ['exports'],
    reportedBy: 'support',
    owner: 'privacy'
  });

  const contained = await repos.privacyBreach.transitionIncident(incident.id, 'contained');

  const assessment = await repos.privacyBreach.createAssessment({
    incidentId: incident.id,
    tenantId,
    encryptedData: false,
    containmentEffective: true,
    summary: 'Customer export was sent to an incorrect recipient.'
  });
  const submitted = await repos.privacyBreach.submitAssessment(assessment.id, 'privacy');
  const approvedAssessment = await repos.privacyBreach.approveAssessment(assessment.id);

  const obligation = await repos.privacyBreach.createObligation({
    incidentId: incident.id,
    tenantId,
    noticeType: 'customer',
    recipient: 'affected-customers'
  });

  const notice = await repos.privacyBreach.createNotice({
    incidentId: incident.id,
    obligationId: obligation.id,
    tenantId,
    noticeType: 'customer',
    recipient: 'affected-customers',
    subject: 'Privacy incident notice',
    body: 'We are notifying you of a privacy incident involving your data.'
  });
  const approvedNotice = await repos.privacyBreach.approveNotice(notice.id, 'privacy-lead');
  const sentNotice = await repos.privacyBreach.sendNotice(notice.id);

  const evidence = await repos.privacyBreach.createEvidence({
    incidentId: incident.id,
    tenantId,
    evidenceType: 'timeline',
    title: 'Incident timeline',
    collectedBy: 'privacy'
  });

  const metrics = await repos.privacyBreach.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, incident: contained, assessment: approvedAssessment, submitted, obligation, notice: sentNotice, approvedNotice, evidence, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
