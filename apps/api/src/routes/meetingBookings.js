const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
function repo(req) { return req.context.repositories.meetingBookings; }
function tenant(req) { return operationalTenant(req); }

// Pages
function listPages(req, res) { Promise.resolve(repo(req).listPages(tenant(req), {})).then(data => sendJson(res, 200, { data })); }
function getPage(req, res, id) { Promise.resolve(repo(req).findPageById(tenant(req), id)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Booking page not found' } })); }
function createPage(req, res) {
  const { name, owner_id } = req.body || {};
  if (!name || !owner_id) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name and owner_id are required' } });
  try { const data = repo(req).createPage(tenant(req), req.body); sendJson(res, 201, { data }); }
  catch (err) { sendJson(res, err.status || 400, { error: { code: err.code || 'create_failed', message: err.message } }); }
}
function updatePage(req, res, id) { Promise.resolve(repo(req).updatePage(tenant(req), id, req.body || {})).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Booking page not found' } })); }
function deletePage(req, res, id) { Promise.resolve(repo(req).deletePage(tenant(req), id)).then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Booking page not found' } })); }

// Bookings
function listBookings(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { booking_page_id: url.searchParams.get('booking_page_id') || '', contact_id: url.searchParams.get('contact_id') || '', status: url.searchParams.get('status') || '' };
  for (const k of Object.keys(filters)) if (!filters[k]) delete filters[k];
  Promise.resolve(repo(req).listBookings(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}
function createBooking(req, res, pageId) {
  const { guest_email, start_time, end_time } = req.body || {};
  if (!guest_email || !start_time || !end_time) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'guest_email, start_time, end_time are required' } });
  Promise.resolve(repo(req).createBooking(tenant(req), pageId, req.body)).then(data => sendJson(res, 201, { data }));
}
function updateBooking(req, res, id) { Promise.resolve(repo(req).updateBooking(tenant(req), id, req.body || {})).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Booking not found' } })); }

module.exports = { listPages, getPage, createPage, updatePage, deletePage, listBookings, createBooking, updateBooking };
