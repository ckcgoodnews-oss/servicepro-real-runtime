const fs = require('fs');

const required = [
  'apps/api/src/services/documentService.js',
  'apps/api/src/repositories/documentRepository.js',
  'apps/api/src/routes/documents.js',
  'scripts/seed-document-esign.js',
  'packages/database/postgres/111_document_esign_runtime.sql',
  'docs/sprint111-document-esign-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 111 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeTemplateInput,
  normalizePacketInput,
  normalizeApprovalInput,
  normalizeSignatureRequestInput,
  normalizeRecipientInput,
  normalizeAuditEventInput,
  mergeTemplate,
  validateRequiredFields,
  generatePacket,
  approveApprovalRequest,
  rejectApprovalRequest,
  sendSignatureRequest,
  signRecipient,
  declineRecipient,
  evaluateSignatureStatus,
  completePacket
} = require('../apps/api/src/services/documentService');

const template = normalizeTemplateInput({
  name: 'Order Form',
  body: 'Customer {{ customer.name }} amount {{ contract.amount }}',
  requiredFields: ['customer.name', 'contract.amount']
});
if (template.code !== 'ORDER-FORM') process.exit(1);

const missing = validateRequiredFields(template.requiredFields, { customer: { name: 'Acme' } });
if (missing.valid || missing.missing[0] !== 'contract.amount') process.exit(1);

const merged = mergeTemplate(template.body, { customer: { name: 'Acme' }, contract: { amount: '$10' } });
if (merged !== 'Customer Acme amount $10') process.exit(1);

let packet = normalizePacketInput({
  tenantId: 'tenant_demo',
  templateId: 'tpl1',
  title: 'Acme Order Form',
  mergeData: { customer: { name: 'Acme' }, contract: { amount: '$10' } }
});
packet = generatePacket(packet, template);
if (packet.status !== 'generated' || !packet.generatedBody.includes('Acme')) process.exit(1);

let approval = normalizeApprovalInput({ packetId: 'packet1', approverId: 'legal' });
approval = approveApprovalRequest(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
approval = rejectApprovalRequest({ ...approval, status: 'pending' }, 'no');
if (approval.status !== 'rejected') process.exit(1);

let signature = normalizeSignatureRequestInput({ packetId: 'packet1' });
signature = sendSignatureRequest(signature);
if (signature.status !== 'sent') process.exit(1);

let recipient = normalizeRecipientInput({ signatureRequestId: 'sig1', name: 'Signer', email: 'signer@example.com' });
recipient = signRecipient(recipient);
if (recipient.status !== 'signed') process.exit(1);

signature = evaluateSignatureStatus(signature, [recipient]);
if (signature.status !== 'completed') process.exit(1);

const declined = declineRecipient(normalizeRecipientInput({ signatureRequestId: 'sig1', name: 'Other', email: 'other@example.com' }));
if (declined.status !== 'declined') process.exit(1);

packet = completePacket(packet);
if (packet.status !== 'completed') process.exit(1);

const audit = normalizeAuditEventInput({ packetId: 'packet1', eventType: 'completed' });
if (audit.eventType !== 'completed') process.exit(1);

console.log('Sprint 111 document e-sign runtime patch test passed.');
