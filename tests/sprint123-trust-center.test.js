const fs = require('fs');

const required = [
  'apps/api/src/services/trustCenterService.js',
  'apps/api/src/repositories/trustCenterRepository.js',
  'apps/api/src/routes/trustCenter.js',
  'scripts/seed-trust-center.js',
  'packages/database/postgres/123_trust_center.sql',
  'docs/sprint123-trust-center.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 123 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeProfileInput,
  normalizeDocumentInput,
  normalizeAccessRequestInput,
  normalizeShareInput,
  normalizeAuditEventInput,
  publishProfile,
  publishDocument,
  documentRequiresNda,
  approveAccessRequest,
  rejectAccessRequest,
  markNdaSigned,
  createShareToken,
  viewShare,
  revokeShare,
  isShareActive,
  trustCenterMetrics
} = require('../apps/api/src/services/trustCenterService');

let profile = normalizeProfileInput({ tenantId: 'tenant_demo', companyName: 'ServicePro' });
profile = publishProfile(profile, '2026-07-07T00:00:00.000Z');
if (profile.status !== 'published') process.exit(1);

let document = normalizeDocumentInput({ tenantId: 'tenant_demo', title: 'SOC 2 Report', documentType: 'soc2', visibility: 'nda_required' });
if (!documentRequiresNda(document)) process.exit(1);
document = publishDocument(document);
if (document.status !== 'published') process.exit(1);

let request = normalizeAccessRequestInput({ tenantId: 'tenant_demo', documentId: 'doc1', requesterEmail: 'admin@example.com', ndaStatus: 'pending' });
request = markNdaSigned(request);
if (request.ndaStatus !== 'signed') process.exit(1);
request = approveAccessRequest(request, 'security@example.com', '2026-07-07T00:00:00.000Z');
if (request.status !== 'approved') process.exit(1);
const rejected = rejectAccessRequest({ ...request, status: 'submitted' }, 'security@example.com', 'No reason');
if (rejected.status !== 'rejected') process.exit(1);

const token = createShareToken('doc1', 'admin@example.com', '2026-07-07T00:00:00.000Z');
if (!token) process.exit(1);

let share = normalizeShareInput({ tenantId: 'tenant_demo', documentId: 'doc1', accessRequestId: 'req1', token, expiresAt: '2026-08-01T00:00:00.000Z' });
if (!isShareActive(share, '2026-07-08T00:00:00.000Z')) process.exit(1);
share = viewShare(share);
if (!share.lastViewedAt) process.exit(1);
share = revokeShare(share, 'security@example.com');
if (share.status !== 'revoked') process.exit(1);

const audit = normalizeAuditEventInput({ tenantId: 'tenant_demo', eventType: 'share_viewed' });
if (audit.eventType !== 'share_viewed') process.exit(1);

const metrics = trustCenterMetrics({ profiles: [profile], documents: [document], requests: [request], shares: [share] });
if (metrics.publishedProfiles !== 1 || metrics.publishedDocuments !== 1 || metrics.approvedRequests !== 1) process.exit(1);

console.log('Sprint 123 trust center patch test passed.');
