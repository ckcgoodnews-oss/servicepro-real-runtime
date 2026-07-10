const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const incident = await repos.securityIncidentResponse.createIncident({ tenantId, title: 'Suspicious administrator login', incidentType: 'credential_compromise', source: 'siem', reportedBy: 'soc', affectedAssetIds: ['asset_demo_prod_api_01'], affectedUserIds: ['admin_demo'], businessImpact: 'Potential customer-facing administrative access exposure.' });
  const investigating = await repos.securityIncidentResponse.startInvestigation(incident.id, 'soc-lead');
  const task = await repos.securityIncidentResponse.createTask({ incidentId: incident.id, tenantId, title: 'Disable suspicious session', taskType: 'containment', owner: 'iam' });
  const completedTask = await repos.securityIncidentResponse.completeTask(task.id);
  const evidence = await repos.securityIncidentResponse.createEvidence({ incidentId: incident.id, tenantId, evidenceType: 'siem_query', title: 'SIEM login timeline', fileUrl: 's3://security/incidents/sec-000001/siem-login-timeline.json', collectedBy: 'soc' });
  const communication = await repos.securityIncidentResponse.createCommunication({ incidentId: incident.id, tenantId, audience: 'internal-security', channel: 'email', subject: 'Security incident update', body: 'Suspicious administrator login is under investigation.' });
  await repos.securityIncidentResponse.approveCommunication(communication.id, 'soc-lead');
  const sentComm = await repos.securityIncidentResponse.sendCommunication(communication.id);
  await repos.securityIncidentResponse.transitionIncident(incident.id, 'contained');
  await repos.securityIncidentResponse.transitionIncident(incident.id, 'resolved');
  const review = await repos.securityIncidentResponse.createReview({ incidentId: incident.id, tenantId, facilitator: 'security' });
  const completedReview = await repos.securityIncidentResponse.completeReview(review.id, 'Weak conditional access.', 'Tighten privileged login policies.');
  const action = await repos.securityIncidentResponse.createAction({ incidentId: incident.id, reviewId: review.id, tenantId, title: 'Require phishing-resistant MFA for admins', severity: 'high', owner: 'iam' });
  const completedAction = await repos.securityIncidentResponse.completeAction(action.id);
  const closed = await repos.securityIncidentResponse.transitionIncident(incident.id, 'closed');
  const metrics = await repos.securityIncidentResponse.metrics(tenantId);
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, incident: closed, investigating, task: completedTask, evidence, communication: sentComm, review: completedReview, action: completedAction, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
