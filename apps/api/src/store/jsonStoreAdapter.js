const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { defaultTenantSettings } = require('../services/tenantSettingsService');
const { defaultWorkflowRules } = require('../services/workflowService');

const dataFile = path.resolve(process.env.DATA_FILE || './data/servicepro-runtime.json');

function makeSeedData() {
  const stamp = new Date().toISOString();
  const sampleLine = { code: 'DRAIN-CLEAN', name: 'Drain cleaning', description: 'Standard drain cleaning service', quantity: 1, unitPrice: 225, unitCost: 85, taxable: true, lineSubtotal: 225, lineCost: 85 };

  return {
    tenantSettings: [defaultTenantSettings('tenant_demo')],
    workflowRules: [{ id: 'workflow_demo_job', ...defaultWorkflowRules('tenant_demo') }],
    workflowEvents: [],
    users: [
      { id: 'user_owner', tenantId: 'tenant_demo', email: 'owner@example.com', name: 'Business Owner', passwordHash: bcrypt.hashSync('ChangeMe123!', 10), roles: ['owner'], permissions: [], createdAt: stamp, updatedAt: stamp },
      { id: 'user_technician', tenantId: 'tenant_demo', email: 'tech@example.com', name: 'Demo Technician', passwordHash: bcrypt.hashSync('ChangeMe123!', 10), roles: ['technician'], permissions: [], createdAt: stamp, updatedAt: stamp }
    ],
    integrityRuns: [],
    securityEvents: [],
    requestMetrics: [],
    auditEvents: [],
    exportRuns: [],
    messageTemplates: [{ id: 'tmpl_booking', tenantId: 'tenant_demo', templateKey: 'booking_requested', name: 'Booking Requested', channel: 'email', subject: 'Service request received', body: 'Hello {{customerName}}, we received your {{serviceType}} request for {{requestedDate}}.', active: true, createdAt: stamp, updatedAt: stamp }],
    notifications: [],
    portalAccounts: [{ id: 'portal_demo_1', tenantId: 'tenant_demo', customerId: 'cust_demo_1', email: 'customer@example.com', passwordHash: bcrypt.hashSync('ChangeMe123!', 10), enabled: true, createdAt: stamp, updatedAt: stamp }],
    portalBookings: [],
    authEvents: [],
    authSessions: [],
    passwordResetTokens: [],
    invitations: [],
    mfaChallenges: [],
    userApiTokens: [],
    organizationUnits: [],
    customerAssets: [{ id:'asset_demo_1',tenantId:'tenant_demo',customerId:'cust_demo_1',jobId:'job_demo_1',assetType:'water_heater',name:'Bradford White 50-gallon',manufacturer:'Bradford White',model:'RG250T6N',serialNumber:'BW-2024-1842',installedDate:'2024-03-18',warrantyExpiresAt:'2030-03-18',location:'Utility room',status:'active',notes:'Annual flush recommended.',metadata:{},createdAt:stamp,updatedAt:stamp }],
    assetServiceHistory: [{ id:'assethist_demo_1',tenantId:'tenant_demo',assetId:'asset_demo_1',jobId:'job_demo_1',serviceDate:'2026-06-24',eventType:'inspection',summary:'Annual safety inspection',technicianId:'tech_demo_1',notes:'Operating normally; anode rod at 70%.',metadata:{},createdAt:stamp,updatedAt:stamp }],
    mediaAttachments: [{ id:'media_demo_1',tenantId:'tenant_demo',entityType:'asset',entityId:'asset_demo_1',filename:'installation-manual.pdf',originalFilename:'installation-manual.pdf',mimeType:'application/pdf',mediaKind:'document',sizeBytes:284000,storageProvider:'local',storageKey:'tenant_demo/asset/asset_demo_1/installation-manual.pdf',checksumSha256:'',caption:'Installation manual',description:'Manufacturer installation and service guide.',visibility:'internal',tags:['manual'],metadata:{},createdBy:'user_owner',createdAt:stamp,updatedAt:stamp }],
    services: [
      { id: 'svc_1', tenantId: 'tenant_demo', code: 'DRAIN-CLEAN', name: 'Drain cleaning', description: 'Standard drain cleaning service', category: 'drain', basePrice: 225, unitCost: 85, taxable: true, active: true, createdAt: stamp, updatedAt: stamp },
      { id: 'svc_2', tenantId: 'tenant_demo', code: 'WH-DIAG', name: 'Water heater diagnostic', description: 'Diagnostic inspection for water heater issues', category: 'water_heater', basePrice: 149, unitCost: 45, taxable: true, active: true, createdAt: stamp, updatedAt: stamp }
    ],
    inventoryItems: [{ id: 'item_demo_1', tenantId: 'tenant_demo', sku: 'PVC-TRAP-15', name: '1.5 inch PVC P-Trap', description: 'Standard PVC trap', category: 'drain_parts', unitCost: 4.25, unitPrice: 14.99, quantityOnHand: 25, reorderPoint: 5, active: true, createdAt: stamp, updatedAt: stamp }],
    stockAdjustments: [],
    materialUsage: [],
    customers: [{ id: 'cust_demo_1', tenantId: 'tenant_demo', firstName: 'Maria', lastName: 'Johnson', phone: '555-0101', email: 'maria@example.com', createdAt: stamp, updatedAt: stamp }],
    jobs: [{ id: 'job_demo_1', tenantId: 'tenant_demo', customerId: 'cust_demo_1', title: 'Kitchen sink clog', status: 'open', priority: 'normal', createdAt: stamp, updatedAt: stamp }],
    technicians: [{ id: 'tech_demo_1', tenantId: 'tenant_demo', name: 'Chris Technician', email: 'tech@example.com', phone: '555-0202', skills: ['drain'], active: true, createdAt: stamp, updatedAt: stamp }],
    appointments: [{ id:'appt_demo_1',tenantId:'tenant_demo',jobId:'job_demo_1',customerId:'cust_demo_1',technicianId:'tech_demo_1',startTime:new Date(new Date().setHours(10,0,0,0)).toISOString(),endTime:new Date(new Date().setHours(12,0,0,0)).toISOString(),status:'scheduled',notes:'Customer requested text on arrival.',createdAt:stamp,updatedAt:stamp }],
    dispatchAssignments: [],
    estimates: [{ id: 'est_demo_1', tenantId: 'tenant_demo', customerId: 'cust_demo_1', jobId: 'job_demo_1', status: 'draft', taxRate: 0.07, lines: [sampleLine], subtotal: 225, tax: 15.75, total: 240.75, marginPercent: 62.22, createdAt: stamp, updatedAt: stamp }],
    invoices: [{ id: 'inv_demo_1', tenantId: 'tenant_demo', customerId: 'cust_demo_1', jobId: 'job_demo_1', status: 'sent', taxRate: 0.07, lines: [sampleLine], subtotal: 225, tax: 15.75, total: 240.75, paidAmount: 0, balanceDue: 240.75, createdAt: stamp, updatedAt: stamp }],
    payments: []
  };
}

function ensureFile() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(makeSeedData(), null, 2));
}

function createJsonStore() {
  ensureFile();
  return {
    type: 'json',
    read() {
      ensureFile();
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      for (const key of ['tenantSettings','workflowRules','workflowEvents','users','integrityRuns','securityEvents','requestMetrics','auditEvents','exportRuns','messageTemplates','notifications','portalAccounts','portalBookings','authEvents','authSessions','passwordResetTokens','invitations','mfaChallenges','userApiTokens','organizationUnits','customerAssets','assetServiceHistory','mediaAttachments','services','inventoryItems','stockAdjustments','materialUsage','customers','jobs','technicians','appointments','dispatchAssignments','estimates','invoices','payments']) {
        if (!data[key]) data[key] = [];
      }
      return data;
    },
    write(data) {
      ensureFile();
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    },
    reset() {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(makeSeedData(), null, 2));
    }
  };
}

module.exports = { createJsonStore };
