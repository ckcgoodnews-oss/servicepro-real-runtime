const fs = require('fs');

const required = [
  'apps/api/src/services/evidenceFulfillmentService.js',
  'apps/api/src/repositories/evidenceFulfillmentRepository.js',
  'apps/api/src/routes/evidenceFulfillment.js',
  'scripts/seed-evidence-fulfillment.js',
  'packages/database/postgres/125_evidence_fulfillment.sql',
  'docs/sprint125-evidence-fulfillment.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 125 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeBundleInput,
  normalizeBundleItemInput,
  normalizeFulfillmentRequestInput,
  normalizeApprovalInput,
  normalizeDeliveryLinkInput,
  normalizeAccessEventInput,
  markBundleReady,
  approveBundle,
  approveRequest,
  rejectRequest,
  approveDelivery,
  rejectDelivery,
  createDeliveryToken,
  markDelivered,
  openDeliveryLink,
  revokeDeliveryLink,
  isDeliveryLinkActive,
  fulfillmentMetrics
} = require('../apps/api/src/services/evidenceFulfillmentService');

let bundle = normalizeBundleInput({ tenantId: 'tenant_demo', name: 'Due Diligence Bundle' });
if (bundle.code !== 'DUE-DILIGENCE-BUNDLE') process.exit(1);
bundle = markBundleReady(bundle);
bundle = approveBundle(bundle);
if (bundle.status !== 'approved') process.exit(1);

const item = normalizeBundleItemInput({ bundleId: 'bundle1', title: 'SOC 2', itemType: 'report' });
if (!item.included) process.exit(1);

let request = normalizeFulfillmentRequestInput({ tenantId: 'tenant_demo', customerName: 'Customer Co', requesterEmail: 'admin@example.com', requestedAt: '2026-07-07T00:00:00.000Z' });
if (!request.dueAt.startsWith('2026-07-12')) process.exit(1);
request = approveRequest(request);
if (request.status !== 'approved') process.exit(1);
const rejected = rejectRequest({ ...request, status: 'submitted' }, 'No NDA');
if (rejected.status !== 'rejected') process.exit(1);

let approval = normalizeApprovalInput({ requestId: 'req1', approverId: 'security' });
approval = approveDelivery(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
const rejectedApproval = rejectDelivery({ ...approval, status: 'pending' }, 'no');
if (rejectedApproval.status !== 'rejected') process.exit(1);

const token = createDeliveryToken('req1', 'admin@example.com', '2026-07-07T00:00:00.000Z');
let link = normalizeDeliveryLinkInput({ requestId: 'req1', bundleId: 'bundle1', token, expiresAt: '2026-08-01T00:00:00.000Z' });
if (!isDeliveryLinkActive(link, '2026-07-08T00:00:00.000Z')) process.exit(1);
link = openDeliveryLink(link);
if (!link.openedAt) process.exit(1);
link = revokeDeliveryLink(link, 'security');
if (link.status !== 'revoked') process.exit(1);

request = markDelivered(request);
if (request.status !== 'delivered') process.exit(1);

const event = normalizeAccessEventInput({ requestId: 'req1', eventType: 'link_opened' });
if (event.eventType !== 'link_opened') process.exit(1);

const metrics = fulfillmentMetrics({ bundles: [bundle], requests: [request], approvals: [approval], links: [link] });
if (metrics.approvedBundles !== 1 || metrics.deliveredRequests !== 1) process.exit(1);

console.log('Sprint 125 evidence fulfillment patch test passed.');
