const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const template = await repos.documents.createTemplate({
    name: 'Enterprise Order Form',
    status: 'active',
    documentType: 'contract',
    requiredFields: ['customer.name', 'contract.amount'],
    body: 'Order Form for {{ customer.name }}. Total contract value: {{ contract.amount }}.'
  });

  const packet = await repos.documents.createPacket({
    tenantId,
    templateId: template.id,
    title: 'Demo Field Service Order Form',
    relatedType: 'contract',
    relatedId: 'contract_demo',
    mergeData: { customer: { name: 'Demo Field Service Co.' }, contract: { amount: '$12,000.00' } }
  });

  const generated = await repos.documents.generatePacket(packet.id);
  const approval = await repos.documents.createApproval({ packetId: packet.id, approverId: 'legal-ops', approverName: 'Legal Operations' });
  const approved = await repos.documents.approve(approval.id, 'Approved for signature.');
  const signature = await repos.documents.createSignatureRequest({ packetId: packet.id, subject: 'Please sign your order form', message: 'Review and sign when ready.' });
  const recipient = await repos.documents.createRecipient({ signatureRequestId: signature.id, name: 'Customer Signer', email: 'signer@example.com' });
  const sent = await repos.documents.sendSignatureRequest(signature.id);
  const signed = await repos.documents.signRecipient(recipient.id);
  const audit = await repos.documents.auditTrail(packet.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, template, packet: generated, approval: approved, signature: sent, recipient: signed, audit }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
