const { parseJsonBody, sendJson, notFound } = require('./utils/http');
const { tenantMiddleware } = require('./middleware/tenant');
const { authGuard } = require('./middleware/authGuard');
const { portalAuthGuard } = require('./middleware/portalAuthGuard');
const { requirePermission } = require('./middleware/requirePermission');
const { attachAuditCompletion } = require('./middleware/requestAudit');
const { attachRequestId } = require('./middleware/requestId');
const { attachRequestMetrics } = require('./middleware/requestMetrics');
const { applySecurityHeaders } = require('./middleware/securityHeaders');
const { applyCors } = require('./middleware/cors');
const { rejectIfPayloadTooLarge } = require('./middleware/bodyLimit');
const { applyRateLimit } = require('./middleware/rateLimit');
const { applyRouteValidation } = require('./middleware/routeValidation');
const { buildHealth, buildReadiness } = require('./services/healthService');
const { PERMISSIONS } = require('./auth/permissions');
const { attachRequestContext } = require('./context/requestContext');

const auth = require('./routes/auth');
const portal = require('./routes/portal');
const tenantAdmin = require('./routes/tenantAdmin');
const workflows = require('./routes/workflows');
const notifications = require('./routes/notifications');
const reports = require('./routes/reports');
const dashboard = require('./routes/dashboard');
const profile = require('./routes/profile');
const organization = require('./routes/organization');
const customerAssets = require('./routes/customerAssets');
const knowledge = require('./routes/knowledge');
const exportsRoute = require('./routes/exports');
const audit = require('./routes/audit');
const observability = require('./routes/observability');
const security = require('./routes/security');
const integrity = require('./routes/integrity');
const customers = require('./routes/customers');
const jobs = require('./routes/jobs');
const services = require('./routes/services');
const estimates = require('./routes/estimates');
const invoices = require('./routes/invoices');
const payments = require('./routes/payments');
const technicians = require('./routes/technicians');
const appointments = require('./routes/appointments');
const dispatch = require('./routes/dispatch');
const inventory = require('./routes/inventory');
const materials = require('./routes/materials');
const privacyCaseOrchestration = require('./routes/privacyCaseOrchestration');
const privacyDsarOps = require('./routes/privacyDsarOps');
const privacyDiscovery = require('./routes/privacyDiscovery');
const privacyAppeals = require('./routes/privacyAppeals');
const privacyCompliance = require('./routes/privacyCompliance');
const privacyRisk = require('./routes/privacyRisk');
const privacyMonitoring = require('./routes/privacyMonitoring');
const privacyDataTransfers = require('./routes/privacyDataTransfers');
const phase09Governance = require('./routes/phase09Governance');
const phase14EnterpriseProduction = require('./routes/phase14EnterpriseProduction');
const phase13EnterpriseAnalytics = require('./routes/phase13EnterpriseAnalytics');
const phase12Marketplace = require('./routes/phase12Marketplace');
const phase11PlatformOperations = require('./routes/phase11PlatformOperations');
const phase10AiPlatform = require('./routes/phase10AiPlatform');

const phase15PostGaLts = require('./routes/phase15PostGaLts');

const phase16EnterpriseIntelligence = require('./routes/phase16EnterpriseIntelligence');

const phase17GlobalScale = require('./routes/phase17GlobalScale');

const phase18IndustrySolutions = require('./routes/phase18IndustrySolutions');

const phase19PlatformExtensibility = require('./routes/phase19PlatformExtensibility');

const phase20Version3Foundation = require('./routes/phase20Version3Foundation');
const phase21Version3Ga = require('./routes/phase21Version3Ga');
const phase27Version4Ga = require('./routes/phase27Version4Ga');
const phase26Version4FoundationRc = require('./routes/phase26Version4FoundationRc');
const phase25EnterpriseFederationEcosystem = require('./routes/phase25EnterpriseFederationEcosystem');
const phase24FinancialGrowthOperations = require('./routes/phase24FinancialGrowthOperations');
const phase23CustomerExperienceFieldMobility = require('./routes/phase23CustomerExperienceFieldMobility');
const phase22ServiceIntelligenceAutomation = require('./routes/phase22ServiceIntelligenceAutomation');
const phase33Version5Ga = require('./routes/phase33Version5Ga');
const phase32Version5FoundationRc = require('./routes/phase32Version5FoundationRc');
const phase31WorkforceCommerceNetwork = require('./routes/phase31WorkforceCommerceNetwork');
const phase30ConnectedAssetsEdge = require('./routes/phase30ConnectedAssetsEdge');
const phase29AutonomousServiceOperations = require('./routes/phase29AutonomousServiceOperations');
const phase28Version4PostGaReliability = require('./routes/phase28Version4PostGaReliability');
const phase34Version5PostGaAssurance = require('./routes/phase34Version5PostGaAssurance');
const phase35AgenticWorkforceOrchestration = require('./routes/phase35AgenticWorkforceOrchestration');
const phase36SpatialRoboticsOperations = require('./routes/phase36SpatialRoboticsOperations');
const phase37SustainabilityCircularOperations = require('./routes/phase37SustainabilityCircularOperations');
const phase38Version6FoundationRc = require('./routes/phase38Version6FoundationRc');
const phase39Version6Ga = require('./routes/phase39Version6Ga');
const phase45Version7Ga = require('./routes/phase45Version7Ga');
const phase44Version7FoundationRc = require('./routes/phase44Version7FoundationRc');
const phase43GlobalFederationSovereignCloud = require('./routes/phase43GlobalFederationSovereignCloud');
const phase42AutonomousEnterpriseOperations = require('./routes/phase42AutonomousEnterpriseOperations');
const phase41DigitalTwinSimulationPlatform = require('./routes/phase41DigitalTwinSimulationPlatform');
const phase40HyperautomationEnterpriseOrchestration = require('./routes/phase40HyperautomationEnterpriseOrchestration');

async function router(req, res) {
  req.context = {};
  attachRequestId(req, res);
  applySecurityHeaders(req, res);

  if (applyCors(req, res)) return;
  if (rejectIfPayloadTooLarge(req, res)) return;

  if (req.url === '/healthz') return sendJson(res, 200, buildHealth());
  if (req.url === '/readyz') return sendJson(res, 200, buildReadiness());

  tenantMiddleware(req);
  attachRequestContext(req);

  if (applyRateLimit(req, res)) return;

  attachAuditCompletion(req, res);
  attachRequestMetrics(req, res);

  try {
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) req.body = await parseJsonBody(req);
    else req.body = {};
  } catch (err) {
    return sendJson(res, err.status || 400, { error: { code: err.code || 'invalid_json', message: err.message } });
  }

  if (applyRouteValidation(req, res)) return;

  if (req.url === '/auth/login' && req.method === 'POST') return auth.login(req, res);
  if (req.url === '/auth/register' && req.method === 'POST') return auth.register(req, res);
  if (req.url === '/auth/refresh' && req.method === 'POST') return auth.refresh(req, res);
  if (req.url === '/auth/password-reset/request' && req.method === 'POST') return auth.requestPasswordReset(req, res);
  if (req.url === '/auth/password-reset/confirm' && req.method === 'POST') return auth.confirmPasswordReset(req, res);
  if (req.url === '/auth/invitations/accept' && req.method === 'POST') return auth.acceptInvitation(req, res);
  if (req.url === '/auth/mfa/verify' && req.method === 'POST') return auth.verifyMfa(req, res);
  if (req.url === '/auth/logout' && req.method === 'POST') {
    if (!(await authGuard(req, res))) return;
    return auth.logout(req, res);
  }
  if (req.url === '/portal/login' && req.method === 'POST') return portal.login(req, res);
  if (req.url === '/tenant-profile' && req.method === 'GET') return tenantAdmin.getPublicProfile(req, res);

  if (req.url.startsWith('/portal/api/')) {
    if (!portalAuthGuard(req, res)) return;
    if (req.url === '/portal/api/me' && req.method === 'GET') return portal.me(req, res);
    if (req.url === '/portal/api/tenant-profile' && req.method === 'GET') return tenantAdmin.getPublicProfile(req, res);
    if (req.url === '/portal/api/bookings' && req.method === 'GET') return portal.listBookings(req, res);
    if (req.url === '/portal/api/bookings' && req.method === 'POST') return portal.createBooking(req, res);
    if (req.url === '/portal/api/invoices' && req.method === 'GET') return portal.listInvoices(req, res);
    if (req.url === '/portal/api/estimates' && req.method === 'GET') return portal.listEstimates(req, res);
  
  if (req.url.startsWith('/api/v1/ai-platform/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE10_READ : PERMISSIONS.PHASE10_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase10AiPlatform.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/platform-operations/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE11_READ : PERMISSIONS.PHASE11_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase11PlatformOperations.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/marketplace/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE12_READ : PERMISSIONS.PHASE12_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase12Marketplace.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-analytics/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE13_READ : PERMISSIONS.PHASE13_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase13EnterpriseAnalytics.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-production/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE14_READ : PERMISSIONS.PHASE14_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase14EnterpriseProduction.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/post-ga-lts/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE15_READ : PERMISSIONS.PHASE15_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase15PostGaLts.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-intelligence/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE16_READ : PERMISSIONS.PHASE16_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase16EnterpriseIntelligence.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/global-scale/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE17_READ : PERMISSIONS.PHASE17_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase17GlobalScale.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/industry-solutions/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE18_READ : PERMISSIONS.PHASE18_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase18IndustrySolutions.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/platform-extensibility/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE19_READ : PERMISSIONS.PHASE19_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase19PlatformExtensibility.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/version3-foundation/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE20_READ : PERMISSIONS.PHASE20_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase20Version3Foundation.dispatch(req, res)) return;
    if (phase21Version3Ga.dispatch(req, res)) return;
    if (phase27Version4Ga.dispatch(req, res)) return;
    if (phase26Version4FoundationRc.dispatch(req, res)) return;
    if (phase25EnterpriseFederationEcosystem.dispatch(req, res)) return;
    if (phase24FinancialGrowthOperations.dispatch(req, res)) return;
    if (phase23CustomerExperienceFieldMobility.dispatch(req, res)) return;
    if (phase22ServiceIntelligenceAutomation.dispatch(req, res)) return;
    if (phase33Version5Ga.dispatch(req, res)) return;
    if (phase39Version6Ga.dispatch(req, res)) return;
    if (phase45Version7Ga.dispatch(req, res)) return;
    if (phase44Version7FoundationRc.dispatch(req, res)) return;
    if (phase43GlobalFederationSovereignCloud.dispatch(req, res)) return;
    if (phase42AutonomousEnterpriseOperations.dispatch(req, res)) return;
    if (phase41DigitalTwinSimulationPlatform.dispatch(req, res)) return;
    if (phase40HyperautomationEnterpriseOrchestration.dispatch(req, res)) return;
    if (phase38Version6FoundationRc.dispatch(req, res)) return;
    if (phase37SustainabilityCircularOperations.dispatch(req, res)) return;
    if (phase36SpatialRoboticsOperations.dispatch(req, res)) return;
    if (phase35AgenticWorkforceOrchestration.dispatch(req, res)) return;
    if (phase34Version5PostGaAssurance.dispatch(req, res)) return;
    if (phase32Version5FoundationRc.dispatch(req, res)) return;
    if (phase31WorkforceCommerceNetwork.dispatch(req, res)) return;
    if (phase30ConnectedAssetsEdge.dispatch(req, res)) return;
    if (phase29AutonomousServiceOperations.dispatch(req, res)) return;
    if (phase28Version4PostGaReliability.dispatch(req, res)) return;
  }

  return notFound(res);
  }

  if (req.url.startsWith('/api/')) {
    const authorized = await authGuard(req, res);
    if (!authorized) return;
  }

  if (req.url === '/api/v1/me' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.USERS_SELF_READ)(req, res)) return;
    return auth.me(req, res);
  }
  if (req.url === '/api/v1/authz' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ADMIN_AUTHZ_READ)(req, res)) return;
    return auth.authz(req, res);
  }

  if (req.url === '/api/v1/workflows' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.WORKFLOWS_READ)(req, res)) return;
    return workflows.listRules(req, res);
  }
  if (req.url === '/api/v1/workflows' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.WORKFLOWS_WRITE)(req, res)) return;
    return workflows.upsertRule(req, res);
  }
  if (req.url === '/api/v1/workflow-events' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.WORKFLOWS_READ)(req, res)) return;
    return workflows.listEvents(req, res);
  }
  const jobTransitionMatch = req.url.match(/^\/api\/v1\/jobs\/([^/]+)\/transition$/);
  if (jobTransitionMatch && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.WORKFLOWS_TRANSITION)(req, res)) return;
    return workflows.transitionJob(req, res, jobTransitionMatch[1]);
  }

  if (req.url === '/api/v1/tenant/settings' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.TENANT_SETTINGS_READ)(req, res)) return;
    return tenantAdmin.getSettings(req, res);
  }
  if (req.url === '/api/v1/tenant/settings' && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.TENANT_SETTINGS_WRITE)(req, res)) return;
    return tenantAdmin.updateSettings(req, res);
  }
  if (req.url === '/api/v1/tenant/branding' && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.TENANT_SETTINGS_WRITE)(req, res)) return;
    return tenantAdmin.updateBranding(req, res);
  }
  if (req.url === '/api/v1/tenant/features' && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.TENANT_SETTINGS_WRITE)(req, res)) return;
    return tenantAdmin.updateFeatures(req, res);
  }

  if (req.url === '/api/v1/integrity' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.INTEGRITY_READ)(req, res)) return;
    return integrity.list(req, res);
  }
  if (req.url === '/api/v1/integrity/run' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.INTEGRITY_RUN)(req, res)) return;
    return integrity.run(req, res);
  }

  if (req.url === '/api/v1/security/events' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.AUDIT_READ)(req, res)) return;
    return security.events(req, res);
  }
  if (req.url === '/api/v1/security/rate-limits' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.AUDIT_READ)(req, res)) return;
    return security.rateLimits(req, res);
  }

  if (req.url === '/api/v1/observability/metrics' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.AUDIT_READ)(req, res)) return;
    return observability.metrics(req, res);
  }
  if (req.url === '/api/v1/observability/summary' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.AUDIT_READ)(req, res)) return;
    return observability.summary(req, res);
  }

  if (req.url === '/api/v1/audit' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.AUDIT_READ)(req, res)) return;
    return audit.list(req, res);
  }
  if (req.url === '/api/v1/audit' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.AUDIT_WRITE)(req, res)) return;
    return audit.create(req, res);
  }

  if (req.url === '/api/v1/exports' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.REPORTS_EXPORT)(req, res)) return;
    return exportsRoute.list(req, res);
  }
  if (req.url === '/api/v1/exports' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.REPORTS_EXPORT)(req, res)) return;
    return exportsRoute.create(req, res);
  }

  if (req.url === '/api/v1/reports' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.REPORTS_READ)(req, res)) return;
    return reports.catalog(req, res);
  }
  if (req.url === '/api/v1/reports/dashboard' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.REPORTS_READ)(req, res)) return;
    return reports.dashboard(req, res);
  }

  if (req.url === '/api/v1/organization' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ORGANIZATION_READ)(req, res)) return;
    return organization.list(req, res);
  }
  if (req.url === '/api/v1/organization' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.ORGANIZATION_WRITE)(req, res)) return;
    return organization.create(req, res);
  }
  const organizationMatch = req.url.match(/^\/api\/v1\/organization\/([^/]+)$/);
  if (organizationMatch && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.ORGANIZATION_WRITE)(req, res)) return;
    return organization.update(req, res, organizationMatch[1]);
  }
  if (organizationMatch && req.method === 'DELETE') {
    if (!requirePermission(PERMISSIONS.ORGANIZATION_DELETE)(req, res)) return;
    return organization.remove(req, res, organizationMatch[1]);
  }
  if (req.url === '/api/v1/assets' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ASSETS_READ)(req, res)) return;
    return customerAssets.list(req, res);
  }
  if (req.url === '/api/v1/assets' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.ASSETS_WRITE)(req, res)) return;
    return customerAssets.create(req, res);
  }
  const assetHistoryMatch = req.url.match(/^\/api\/v1\/assets\/([^/]+)\/history$/);
  if (assetHistoryMatch && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ASSETS_READ)(req, res)) return;
    return customerAssets.listHistory(req, res, assetHistoryMatch[1]);
  }
  if (assetHistoryMatch && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.ASSETS_WRITE)(req, res)) return;
    return customerAssets.createHistory(req, res, assetHistoryMatch[1]);
  }
  const assetAttachmentMatch = req.url.match(/^\/api\/v1\/assets\/([^/]+)\/attachments$/);
  if (assetAttachmentMatch && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ASSETS_READ)(req, res)) return;
    return customerAssets.listAttachments(req, res, assetAttachmentMatch[1]);
  }
  if (assetAttachmentMatch && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.ASSETS_WRITE)(req, res)) return;
    return customerAssets.createAttachment(req, res, assetAttachmentMatch[1]);
  }
  const assetMatch = req.url.match(/^\/api\/v1\/assets\/([^/]+)$/);
  if (assetMatch && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.ASSETS_READ)(req, res)) return;
    return customerAssets.get(req, res, assetMatch[1]);
  }
  if (assetMatch && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.ASSETS_WRITE)(req, res)) return;
    return customerAssets.update(req, res, assetMatch[1]);
  }
  if (req.url === '/api/v1/knowledge' && req.method === 'GET') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_READ)(req, res)) return; return knowledge.list(req, res); }
  if (req.url === '/api/v1/knowledge' && req.method === 'POST') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_WRITE)(req, res)) return; return knowledge.create(req, res); }
  const knowledgeAttachmentMatch = req.url.match(/^\/api\/v1\/knowledge\/([^/]+)\/attachments$/);
  if (knowledgeAttachmentMatch && req.method === 'GET') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_READ)(req, res)) return; return knowledge.listAttachments(req, res, knowledgeAttachmentMatch[1]); }
  if (knowledgeAttachmentMatch && req.method === 'POST') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_WRITE)(req, res)) return; return knowledge.createAttachment(req, res, knowledgeAttachmentMatch[1]); }
  const knowledgeMatch = req.url.match(/^\/api\/v1\/knowledge\/([^/]+)$/);
  if (knowledgeMatch && req.method === 'GET') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_READ)(req, res)) return; return knowledge.get(req, res, knowledgeMatch[1]); }
  if (knowledgeMatch && req.method === 'PATCH') { if (!requirePermission(PERMISSIONS.KNOWLEDGE_WRITE)(req, res)) return; return knowledge.update(req, res, knowledgeMatch[1]); }
  if (req.url === '/api/v1/profile' && req.method === 'GET') return profile.get(req,res);
  if (req.url === '/api/v1/profile' && req.method === 'PATCH') return profile.update(req,res);
  if (req.url === '/api/v1/profile/password' && req.method === 'POST') return profile.changePassword(req,res);
  if (req.url === '/api/v1/profile/mfa' && req.method === 'PATCH') return profile.setMfa(req,res);
  if (req.url === '/api/v1/profile/tokens' && req.method === 'GET') return profile.listTokens(req,res);
  if (req.url === '/api/v1/profile/tokens' && req.method === 'POST') return profile.createToken(req,res);
  const profileTokenMatch=req.url.match(/^\/api\/v1\/profile\/tokens\/([^/]+)$/);
  if(profileTokenMatch && req.method==='DELETE') return profile.revokeToken(req,res,profileTokenMatch[1]);
  if (req.url === '/api/v1/dashboard/summary' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.REPORTS_READ)(req, res)) return;
    return dashboard.summary(req, res);
  }
  const reportMatch = req.url.match(/^\/api\/v1\/reports\/([^/]+)$/);
  if (reportMatch && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.REPORTS_READ)(req, res)) return;
    return reports.run(req, res, reportMatch[1]);
  }

  if (req.url === '/api/v1/notifications/templates' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.NOTIFICATIONS_READ)(req, res)) return;
    return notifications.listTemplates(req, res);
  }
  if (req.url === '/api/v1/notifications/templates' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.NOTIFICATIONS_WRITE)(req, res)) return;
    return notifications.createTemplate(req, res);
  }
  if (req.url === '/api/v1/notifications' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.NOTIFICATIONS_READ)(req, res)) return;
    return notifications.listNotifications(req, res);
  }
  if (req.url === '/api/v1/notifications' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.NOTIFICATIONS_WRITE)(req, res)) return;
    return notifications.queueNotification(req, res);
  }
  if (req.url === '/api/v1/notifications/process' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.NOTIFICATIONS_PROCESS)(req, res)) return;
    return notifications.processQueued(req, res);
  }

  if (req.url === '/api/v1/portal/accounts' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.PORTAL_ACCOUNTS_READ)(req, res)) return;
    return portal.listAccounts(req, res);
  }
  if (req.url === '/api/v1/portal/accounts' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PORTAL_ACCOUNTS_WRITE)(req, res)) return;
    return portal.createAccount(req, res);
  }
  if (req.url === '/api/v1/portal/bookings' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.PORTAL_BOOKINGS_READ)(req, res)) return;
    return Promise.resolve(req.context.repositories.portalBookings.list(req.context.tenantId)).then(data => sendJson(res, 200, { data }));
  }

  const routeSets = [
    ['customers', customers, PERMISSIONS.CUSTOMERS_READ, PERMISSIONS.CUSTOMERS_WRITE, PERMISSIONS.CUSTOMERS_DELETE],
    ['jobs', jobs, PERMISSIONS.JOBS_READ, PERMISSIONS.JOBS_WRITE, PERMISSIONS.JOBS_DELETE],
    ['services', services, PERMISSIONS.SERVICES_READ, PERMISSIONS.SERVICES_WRITE, PERMISSIONS.SERVICES_DELETE],
    ['estimates', estimates, PERMISSIONS.ESTIMATES_READ, PERMISSIONS.ESTIMATES_WRITE, PERMISSIONS.ESTIMATES_DELETE],
    ['invoices', invoices, PERMISSIONS.INVOICES_READ, PERMISSIONS.INVOICES_WRITE, PERMISSIONS.INVOICES_DELETE],
    ['payments', payments, PERMISSIONS.PAYMENTS_READ, PERMISSIONS.PAYMENTS_WRITE, PERMISSIONS.PAYMENTS_DELETE],
    ['technicians', technicians, PERMISSIONS.TECHNICIANS_READ, PERMISSIONS.TECHNICIANS_WRITE, PERMISSIONS.TECHNICIANS_WRITE],
    ['appointments', appointments, PERMISSIONS.SCHEDULE_READ, PERMISSIONS.SCHEDULE_WRITE, PERMISSIONS.SCHEDULE_DELETE],
    ['inventory', inventory, PERMISSIONS.INVENTORY_READ, PERMISSIONS.INVENTORY_WRITE, PERMISSIONS.INVENTORY_DELETE]
  ];

  for (const [name, handler, readPerm, writePerm, deletePerm] of routeSets) {
    if (req.url === `/api/v1/${name}` && req.method === 'GET') {
      if (!requirePermission(readPerm)(req, res)) return;
      return handler.list(req, res);
    }
    if (req.url === `/api/v1/${name}` && req.method === 'POST') {
      if (!requirePermission(writePerm)(req, res)) return;
      return handler.create(req, res);
    }
    const adjustMatch = req.url.match(new RegExp(`^/api/v1/${name}/([^/]+)/adjust$`));
    if (adjustMatch && req.method === 'POST' && handler.adjust) {
      if (!requirePermission(writePerm)(req, res)) return;
      return handler.adjust(req, res, adjustMatch[1]);
    }
    const match = req.url.match(new RegExp(`^/api/v1/${name}/([^/]+)$`));
    if (match && req.method === 'GET' && handler.get) {
      if (!requirePermission(readPerm)(req, res)) return;
      return handler.get(req, res, match[1]);
    }
    if (match && req.method === 'PATCH' && handler.update) {
      if (!requirePermission(writePerm)(req, res)) return;
      return handler.update(req, res, match[1]);
    }
    if (match && req.method === 'DELETE' && handler.remove) {
      if (!requirePermission(deletePerm)(req, res)) return;
      return handler.remove(req, res, match[1]);
    }
  }

  if (req.url === '/api/v1/materials' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.MATERIALS_READ)(req, res)) return;
    return materials.list(req, res);
  }
  if (req.url === '/api/v1/materials' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.MATERIALS_WRITE)(req, res)) return;
    return materials.create(req, res);
  }

  if (req.url === '/api/v1/dispatch' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.DISPATCH_READ)(req, res)) return;
    return dispatch.list(req, res);
  }
  if (req.url === '/api/v1/dispatch' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.DISPATCH_WRITE)(req, res)) return;
    return dispatch.assign(req, res);
  }
  const dispatchMatch = req.url.match(/^\/api\/v1\/dispatch\/([^/]+)\/status$/);
  if (dispatchMatch && req.method === 'PATCH') {
    if (!requirePermission(PERMISSIONS.DISPATCH_WRITE)(req, res)) return;
    return dispatch.updateStatus(req, res, dispatchMatch[1]);
  }

  if (req.url === '/api/v1/privacy/cases' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyCaseOrchestration.createCase(req, res);
  }
  const privacyCaseAction = req.url.match(/^\/api\/v1\/privacy\/cases\/([^/]+)\/(verify|extend|close)$/);
  if (privacyCaseAction && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyCaseOrchestration[privacyCaseAction[2]](req, res, privacyCaseAction[1]);
  }
  if (req.url === '/api/v1/privacy/case-tasks' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyCaseOrchestration.createTask(req, res);
  }
  const privacyTaskComplete = req.url.match(/^\/api\/v1\/privacy\/case-tasks\/([^/]+)\/complete$/);
  if (privacyTaskComplete && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyCaseOrchestration.completeTask(req, res, privacyTaskComplete[1]);
  }
  if (req.url === '/api/v1/privacy/case-communications' && req.method === 'POST') {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyCaseOrchestration.createCommunication(req, res);
  }
  if (req.url === '/api/v1/privacy/case-metrics' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.PRIVACY_READ)(req, res)) return;
    return privacyCaseOrchestration.metrics(req, res);
  }

  const privacyCreateRoutes = {
    '/api/v1/privacy/dsars': 'createDsar',
    '/api/v1/privacy/consents': 'createConsent',
    '/api/v1/privacy/retention-policies': 'createRetentionPolicy',
    '/api/v1/privacy/deletion-jobs': 'createDeletionJob',
    '/api/v1/privacy/processing-activities': 'createProcessingActivity',
    '/api/v1/privacy/dpias': 'createDpia',
    '/api/v1/privacy/breaches': 'createBreach'
  };
  if (req.method === 'POST' && privacyCreateRoutes[req.url]) {
    if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
    return privacyDsarOps[privacyCreateRoutes[req.url]](req, res);
  }

  const privacyActionRoutes = [
    [/^\/api\/v1\/privacy\/dsars\/([^/]+)\/verify$/, 'verifyDsarIdentity'],
    [/^\/api\/v1\/privacy\/dsars\/([^/]+)\/fulfill$/, 'fulfillDsar'],
    [/^\/api\/v1\/privacy\/dsars\/([^/]+)\/deny$/, 'denyDsar'],
    [/^\/api\/v1\/privacy\/consents\/([^/]+)\/withdraw$/, 'withdrawConsent'],
    [/^\/api\/v1\/privacy\/retention-policies\/([^/]+)\/activate$/, 'activateRetentionPolicy'],
    [/^\/api\/v1\/privacy\/retention-policies\/([^/]+)\/retire$/, 'retireRetentionPolicy'],
    [/^\/api\/v1\/privacy\/deletion-jobs\/([^/]+)\/start$/, 'startDeletionJob'],
    [/^\/api\/v1\/privacy\/deletion-jobs\/([^/]+)\/complete$/, 'completeDeletionJob'],
    [/^\/api\/v1\/privacy\/deletion-jobs\/([^/]+)\/fail$/, 'failDeletionJob'],
    [/^\/api\/v1\/privacy\/processing-activities\/([^/]+)\/activate$/, 'activateProcessingActivity'],
    [/^\/api\/v1\/privacy\/processing-activities\/([^/]+)\/retire$/, 'retireProcessingActivity'],
    [/^\/api\/v1\/privacy\/dpias\/([^/]+)\/review$/, 'submitDpiaForReview'],
    [/^\/api\/v1\/privacy\/dpias\/([^/]+)\/approve$/, 'approveDpia'],
    [/^\/api\/v1\/privacy\/dpias\/([^/]+)\/reject$/, 'rejectDpia'],
    [/^\/api\/v1\/privacy\/breaches\/([^/]+)\/confirm$/, 'confirmBreach'],
    [/^\/api\/v1\/privacy\/breaches\/([^/]+)\/report$/, 'reportBreach'],
    [/^\/api\/v1\/privacy\/breaches\/([^/]+)\/notify-subjects$/, 'notifySubjects'],
    [/^\/api\/v1\/privacy\/breaches\/([^/]+)\/close$/, 'closeBreach']
  ];
  if (req.method === 'POST') {
    for (const [pattern, handler] of privacyActionRoutes) {
      const match = req.url.match(pattern);
      if (!match) continue;
      if (!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req, res)) return;
      return privacyDsarOps[handler](req, res, match[1]);
    }
  }
  if (req.url === '/api/v1/privacy/metrics' && req.method === 'GET') {
    if (!requirePermission(PERMISSIONS.PRIVACY_READ)(req, res)) return;
    return privacyDsarOps.metrics(req, res);
  }
  const discoveryCreates = {'/api/v1/privacy/discovery-scans':'createScan','/api/v1/privacy/discovered-records':'addRecord','/api/v1/privacy/fulfillment-packages':'createPackage'};
  if(req.method==='POST'&&discoveryCreates[req.url]){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyDiscovery[discoveryCreates[req.url]](req,res);}
  const discoveryAction=req.url.match(/^\/api\/v1\/privacy\/(discovery-scans|fulfillment-packages)\/([^/]+)\/(start|complete|fail|submit|approve|deliver)$/);
  if(discoveryAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={start:'startScan',complete:'completeScan',fail:'failScan',submit:'submitPackage',approve:'approvePackage',deliver:'deliverPackage'};return privacyDiscovery[handlers[discoveryAction[3]]](req,res,discoveryAction[2]);}
  if(req.url==='/api/v1/privacy/discovery-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyDiscovery.metrics(req,res);}
  const appealCreates={'/api/v1/privacy/appeals':'createAppeal','/api/v1/privacy/regulator-inquiries':'createInquiry'};
  if(req.method==='POST'&&appealCreates[req.url]){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyAppeals[appealCreates[req.url]](req,res);}
  const appealAction=req.url.match(/^\/api\/v1\/privacy\/(appeals|regulator-inquiries)\/([^/]+)\/(review|decide|submit|close)$/);
  if(appealAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={review:'startReview',decide:'decideAppeal',submit:'submitInquiry',close:'closeInquiry'};return privacyAppeals[handlers[appealAction[3]]](req,res,appealAction[2]);}
  if(req.url==='/api/v1/privacy/appeals-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyAppeals.metrics(req,res);}
  const complianceCreates={'/api/v1/privacy/compliance-evidence':'createEvidence','/api/v1/privacy/compliance-reports':'createReport'};
  if(req.method==='POST'&&complianceCreates[req.url]){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyCompliance[complianceCreates[req.url]](req,res);}
  const complianceAction=req.url.match(/^\/api\/v1\/privacy\/(compliance-evidence|compliance-reports)\/([^/]+)\/(submit|review|generate|publish)$/);
  if(complianceAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={submit:'submitEvidence',review:'reviewEvidence',generate:'generateReport',publish:'publishReport'};return privacyCompliance[handlers[complianceAction[3]]](req,res,complianceAction[2]);}
  if(req.url==='/api/v1/privacy/compliance-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyCompliance.metrics(req,res);}
  if(req.url==='/api/v1/privacy/risk-findings'&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyRisk.createFinding(req,res);}
  const riskAction=req.url.match(/^\/api\/v1\/privacy\/risk-findings\/([^/]+)\/(remediate|request-exception|approve-exception|resolve)$/);
  if(riskAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={remediate:'planRemediation','request-exception':'requestException','approve-exception':'approveException',resolve:'resolveFinding'};return privacyRisk[handlers[riskAction[2]]](req,res,riskAction[1]);}
  if(req.url==='/api/v1/privacy/risk-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyRisk.metrics(req,res);}
  const monitoringCreates={'/api/v1/privacy/monitoring-controls':'createControl','/api/v1/privacy/monitoring-runs':'createRun','/api/v1/privacy/monitoring-alerts':'createAlert'};
  if(req.method==='POST'&&monitoringCreates[req.url]){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyMonitoring[monitoringCreates[req.url]](req,res);}
  const monitoringAction=req.url.match(/^\/api\/v1\/privacy\/(monitoring-runs|monitoring-alerts)\/([^/]+)\/(complete|acknowledge|resolve)$/);
  if(monitoringAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={complete:'completeRun',acknowledge:'acknowledgeAlert',resolve:'resolveAlert'};return privacyMonitoring[handlers[monitoringAction[3]]](req,res,monitoringAction[2]);}
  if(req.url==='/api/v1/privacy/monitoring-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyMonitoring.metrics(req,res);}
  const transferCreates={'/api/v1/privacy/data-transfers':'createTransfer','/api/v1/privacy/transfer-assessments':'createAssessment','/api/v1/privacy/transfer-safeguards':'createSafeguard','/api/v1/privacy/transfer-approvals':'createApproval'};
  if(req.method==='POST'&&transferCreates[req.url]){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;return privacyDataTransfers[transferCreates[req.url]](req,res);}
  const transferAction=req.url.match(/^\/api\/v1\/privacy\/(data-transfers|transfer-assessments|transfer-safeguards|transfer-approvals)\/([^/]+)\/(submit|approve|reject|activate|suspend|terminate)$/);
  if(transferAction&&req.method==='POST'){if(!requirePermission(PERMISSIONS.PRIVACY_WRITE)(req,res))return;const handlers={
    'transfer-assessments:submit':'submitAssessment','transfer-assessments:approve':'approveAssessment','transfer-assessments:reject':'rejectAssessment',
    'transfer-safeguards:activate':'activateSafeguard','transfer-approvals:approve':'approveApproval','transfer-approvals:reject':'rejectApproval',
    'data-transfers:approve':'approveTransfer','data-transfers:activate':'activateTransfer','data-transfers:suspend':'suspendTransfer','data-transfers:terminate':'terminateTransfer'};
    const handler=handlers[`${transferAction[1]}:${transferAction[3]}`];if(handler)return privacyDataTransfers[handler](req,res,transferAction[2]);}
  if(req.url==='/api/v1/privacy/transfer-metrics'&&req.method==='GET'){if(!requirePermission(PERMISSIONS.PRIVACY_READ)(req,res))return;return privacyDataTransfers.metrics(req,res);}

  if (req.url.startsWith('/api/v1/governance/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.GOVERNANCE_READ : PERMISSIONS.GOVERNANCE_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase09Governance.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/ai-platform/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE10_READ : PERMISSIONS.PHASE10_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase10AiPlatform.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/platform-operations/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE11_READ : PERMISSIONS.PHASE11_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase11PlatformOperations.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/marketplace/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE12_READ : PERMISSIONS.PHASE12_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase12Marketplace.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-analytics/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE13_READ : PERMISSIONS.PHASE13_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase13EnterpriseAnalytics.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-production/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE14_READ : PERMISSIONS.PHASE14_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase14EnterpriseProduction.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/post-ga-lts/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE15_READ : PERMISSIONS.PHASE15_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase15PostGaLts.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/enterprise-intelligence/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE16_READ : PERMISSIONS.PHASE16_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase16EnterpriseIntelligence.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/global-scale/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE17_READ : PERMISSIONS.PHASE17_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase17GlobalScale.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/industry-solutions/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE18_READ : PERMISSIONS.PHASE18_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase18IndustrySolutions.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/platform-extensibility/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE19_READ : PERMISSIONS.PHASE19_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase19PlatformExtensibility.dispatch(req, res)) return;
  }


  if (req.url.startsWith('/api/v1/version3-foundation/')) {
    const permission = req.method === 'GET' ? PERMISSIONS.PHASE20_READ : PERMISSIONS.PHASE20_WRITE;
    if (!requirePermission(permission)(req, res)) return;
    if (phase20Version3Foundation.dispatch(req, res)) return;
    if (phase21Version3Ga.dispatch(req, res)) return;
    if (phase27Version4Ga.dispatch(req, res)) return;
    if (phase26Version4FoundationRc.dispatch(req, res)) return;
    if (phase25EnterpriseFederationEcosystem.dispatch(req, res)) return;
    if (phase24FinancialGrowthOperations.dispatch(req, res)) return;
    if (phase23CustomerExperienceFieldMobility.dispatch(req, res)) return;
    if (phase22ServiceIntelligenceAutomation.dispatch(req, res)) return;
    if (phase33Version5Ga.dispatch(req, res)) return;
    if (phase39Version6Ga.dispatch(req, res)) return;
    if (phase45Version7Ga.dispatch(req, res)) return;
    if (phase44Version7FoundationRc.dispatch(req, res)) return;
    if (phase43GlobalFederationSovereignCloud.dispatch(req, res)) return;
    if (phase42AutonomousEnterpriseOperations.dispatch(req, res)) return;
    if (phase41DigitalTwinSimulationPlatform.dispatch(req, res)) return;
    if (phase40HyperautomationEnterpriseOrchestration.dispatch(req, res)) return;
    if (phase38Version6FoundationRc.dispatch(req, res)) return;
    if (phase37SustainabilityCircularOperations.dispatch(req, res)) return;
    if (phase36SpatialRoboticsOperations.dispatch(req, res)) return;
    if (phase35AgenticWorkforceOrchestration.dispatch(req, res)) return;
    if (phase34Version5PostGaAssurance.dispatch(req, res)) return;
    if (phase32Version5FoundationRc.dispatch(req, res)) return;
    if (phase31WorkforceCommerceNetwork.dispatch(req, res)) return;
    if (phase30ConnectedAssetsEdge.dispatch(req, res)) return;
    if (phase29AutonomousServiceOperations.dispatch(req, res)) return;
    if (phase28Version4PostGaReliability.dispatch(req, res)) return;
  }

  return notFound(res);
}

module.exports = { router };
