const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const course = await repos.trainingAwareness.createCourse({
    tenantId,
    title: 'Annual Security Awareness',
    courseType: 'security',
    owner: 'security',
    durationMinutes: 45,
    passingScore: 80,
    renewalDays: 365
  });

  const campaign = await repos.trainingAwareness.createCampaign({
    tenantId,
    courseId: course.id,
    name: '2026 Annual Security Awareness',
    targetRoles: ['all'],
    targetDepartments: ['all'],
    owner: 'security'
  });
  const scheduled = await repos.trainingAwareness.scheduleCampaign(
    campaign.id,
    '2026-07-07T00:00:00.000Z',
    '2026-07-21T00:00:00.000Z'
  );
  const activeCampaign = await repos.trainingAwareness.activateCampaign(campaign.id);

  const assignment = await repos.trainingAwareness.createAssignment({
    tenantId,
    campaignId: campaign.id,
    courseId: course.id,
    subjectId: 'user_demo',
    subjectName: 'Demo User',
    subjectEmail: 'user@example.com',
    role: 'technician',
    department: 'operations'
  });
  const started = await repos.trainingAwareness.startAssignment(assignment.id);

  const evidence = await repos.trainingAwareness.createEvidence({
    assignmentId: assignment.id,
    tenantId,
    evidenceType: 'quiz',
    score: 92,
    passed: true,
    recordedBy: 'lms'
  });

  const reminder = await repos.trainingAwareness.createReminder({
    assignmentId: assignment.id,
    tenantId,
    recipientEmail: 'user@example.com'
  });
  const sentReminder = await repos.trainingAwareness.sendReminder(reminder.id);

  const exception = await repos.trainingAwareness.createException({
    assignmentId: assignment.id,
    tenantId,
    requesterId: 'manager_demo',
    requesterName: 'Demo Manager',
    reason: 'Temporary leave coverage.'
  });
  const rejectedException = await repos.trainingAwareness.rejectException(exception.id, 'security');

  const metrics = await repos.trainingAwareness.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({
    ok: true,
    course,
    campaign: activeCampaign,
    scheduled,
    assignment: started,
    evidence,
    reminder: sentReminder,
    exception: rejectedException,
    metrics
  }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
