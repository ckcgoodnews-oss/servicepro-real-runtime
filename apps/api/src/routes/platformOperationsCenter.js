const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');
const { version } = require('../../../../package.json');

function deny(res) {
  return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
}

function repo(req) {
  return req.context.repositories.platformOperationsCenter;
}

function actor(req) {
  return req.context.userId || '';
}

// ============================================================
// Platform Dashboard (aggregated KPIs)
// ============================================================
async function dashboard(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getDashboard() });
}

// ============================================================
// Deployment & Updates
// ============================================================
async function listReleases(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listReleases() });
}

async function listMigrations(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listMigrations() });
}

async function getDeploymentConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getDeploymentConfig() });
}

async function rollback(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const { targetVersion, reason } = req.body || {};
  if (!targetVersion) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'targetVersion is required' } });
  return sendJson(res, 200, { data: await repo(req).initiateRollback(targetVersion, reason, actor(req)) });
}

async function listEnvironments(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listEnvironments() });
}

// ============================================================
// Backups & Data
// ============================================================
async function listSnapshots(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listSnapshots() });
}

async function createSnapshot(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createSnapshot(req.body || {}, actor(req)) });
}

async function listBackupSchedules(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listBackupSchedules() });
}

async function setBackupSchedule(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).setBackupSchedule(req.body || {}, actor(req)) });
}

async function listRestorePoints(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listRestorePoints() });
}

async function listDataExports(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listDataExports() });
}

async function createDataExport(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createDataExport(req.body || {}, actor(req)) });
}

// ============================================================
// Support
// ============================================================
async function listTickets(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listTickets() });
}

async function createTicketResponse(req, res, ticketId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).respondToTicket(ticketId, req.body || {}, actor(req)) });
}

async function listEscalations(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listEscalations() });
}

async function listAnnouncements(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listAnnouncements() });
}

async function createAnnouncement(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createAnnouncement(req.body || {}, actor(req)) });
}

async function listMaintenanceWindows(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listMaintenanceWindows() });
}

async function createMaintenanceWindow(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createMaintenanceWindow(req.body || {}, actor(req)) });
}

// ============================================================
// AI & Models
// ============================================================
async function listAiModels(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listAiModels() });
}

async function getAiUsage(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getAiUsage() });
}

async function getAiGovernance(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getAiGovernance() });
}

async function getAiTenantConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getAiTenantConfig() });
}

async function updateAiTenantConfig(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateAiTenantConfig(tenantId, req.body || {}, actor(req)) });
}

// ============================================================
// Platform Configuration
// ============================================================
async function getGlobalConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getGlobalConfig() });
}

async function updateGlobalConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateGlobalConfig(req.body || {}, actor(req)) });
}

async function getEmailConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getEmailConfig() });
}

async function updateEmailConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateEmailConfig(req.body || {}, actor(req)) });
}

async function getStorageConfig(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getStorageConfig() });
}

async function getIntegrations(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getIntegrations() });
}

async function getRateLimits(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getRateLimits() });
}

async function updateRateLimits(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateRateLimits(req.body || {}, actor(req)) });
}

async function getFeatureGates(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getFeatureGates() });
}

async function updateFeatureGates(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateFeatureGates(req.body || {}, actor(req)) });
}

// ============================================================
// Enhanced Monitoring
// ============================================================
async function getMetrics(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getMetrics() });
}

async function getUptime(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getUptime() });
}

async function getErrors(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getErrors() });
}

async function getPerformance(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getPerformance() });
}

// ============================================================
// Audit Extensions
// ============================================================
async function getCompliance(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getCompliance() });
}

async function getAuditReports(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getAuditReports() });
}

// ============================================================
// URL Dispatcher
// ============================================================
function dispatch(req, res) {
  const base = '/api/v1/platform/tmc';
  if (!req.url.startsWith(base)) return false;

  const path = req.url.replace(base, '').split('?')[0];
  const method = req.method;

  // Dashboard
  if (path === '/dashboard' && method === 'GET') { dashboard(req, res); return true; }

  // Deployment
  if (path === '/deployment/releases' && method === 'GET') { listReleases(req, res); return true; }
  if (path === '/deployment/migrations' && method === 'GET') { listMigrations(req, res); return true; }
  if (path === '/deployment/config' && method === 'GET') { getDeploymentConfig(req, res); return true; }
  if (path === '/deployment/rollback' && method === 'POST') { rollback(req, res); return true; }
  if (path === '/deployment/environments' && method === 'GET') { listEnvironments(req, res); return true; }

  // Backups
  if (path === '/backups/snapshots' && method === 'GET') { listSnapshots(req, res); return true; }
  if (path === '/backups/snapshots' && method === 'POST') { createSnapshot(req, res); return true; }
  if (path === '/backups/schedules' && method === 'GET') { listBackupSchedules(req, res); return true; }
  if (path === '/backups/schedules' && method === 'POST') { setBackupSchedule(req, res); return true; }
  if (path === '/backups/restore-points' && method === 'GET') { listRestorePoints(req, res); return true; }
  if (path === '/backups/exports' && method === 'GET') { listDataExports(req, res); return true; }
  if (path === '/backups/exports' && method === 'POST') { createDataExport(req, res); return true; }

  // Support
  if (path === '/support/tickets' && method === 'GET') { listTickets(req, res); return true; }
  const ticketResponseMatch = path.match(/^\/support\/tickets\/([^/]+)\/respond$/);
  if (ticketResponseMatch && method === 'POST') { createTicketResponse(req, res, ticketResponseMatch[1]); return true; }
  if (path === '/support/escalations' && method === 'GET') { listEscalations(req, res); return true; }
  if (path === '/support/announcements' && method === 'GET') { listAnnouncements(req, res); return true; }
  if (path === '/support/announcements' && method === 'POST') { createAnnouncement(req, res); return true; }
  if (path === '/support/maintenance' && method === 'GET') { listMaintenanceWindows(req, res); return true; }
  if (path === '/support/maintenance' && method === 'POST') { createMaintenanceWindow(req, res); return true; }

  // AI
  if (path === '/ai/models' && method === 'GET') { listAiModels(req, res); return true; }
  if (path === '/ai/usage' && method === 'GET') { getAiUsage(req, res); return true; }
  if (path === '/ai/governance' && method === 'GET') { getAiGovernance(req, res); return true; }
  if (path === '/ai/tenant-config' && method === 'GET') { getAiTenantConfig(req, res); return true; }
  const aiTenantMatch = path.match(/^\/ai\/tenant-config\/([^/]+)$/);
  if (aiTenantMatch && method === 'PATCH') { updateAiTenantConfig(req, res, aiTenantMatch[1]); return true; }

  // Platform Configuration
  if (path === '/config/global' && method === 'GET') { getGlobalConfig(req, res); return true; }
  if (path === '/config/global' && method === 'PATCH') { updateGlobalConfig(req, res); return true; }
  if (path === '/config/email' && method === 'GET') { getEmailConfig(req, res); return true; }
  if (path === '/config/email' && method === 'PATCH') { updateEmailConfig(req, res); return true; }
  if (path === '/config/storage' && method === 'GET') { getStorageConfig(req, res); return true; }
  if (path === '/config/integrations' && method === 'GET') { getIntegrations(req, res); return true; }
  if (path === '/config/rate-limits' && method === 'GET') { getRateLimits(req, res); return true; }
  if (path === '/config/rate-limits' && method === 'PATCH') { updateRateLimits(req, res); return true; }
  if (path === '/config/feature-gates' && method === 'GET') { getFeatureGates(req, res); return true; }
  if (path === '/config/feature-gates' && method === 'PATCH') { updateFeatureGates(req, res); return true; }

  // Enhanced Monitoring
  if (path === '/metrics' && method === 'GET') { getMetrics(req, res); return true; }
  if (path === '/uptime' && method === 'GET') { getUptime(req, res); return true; }
  if (path === '/errors' && method === 'GET') { getErrors(req, res); return true; }
  if (path === '/performance' && method === 'GET') { getPerformance(req, res); return true; }

  // Audit Extensions
  if (path === '/compliance' && method === 'GET') { getCompliance(req, res); return true; }
  if (path === '/audit-reports' && method === 'GET') { getAuditReports(req, res); return true; }

  return false;
}

module.exports = { dispatch };
