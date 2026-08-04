const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.boards; }
function tenant(req) { return operationalTenant(req); }

// --- Boards ---
function listBoards(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { workspace_id: url.searchParams.get('workspace_id') || '' };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).listBoards(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function getBoard(req, res, id) {
  Promise.resolve(repo(req).findBoardById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Board not found' } }));
}

function createBoard(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  const input = { ...req.body, owner_id: req.body.owner_id || req.user?.email || null };
  Promise.resolve(repo(req).createBoard(tenant(req), input))
    .then(data => sendJson(res, 201, { data }));
}

function updateBoard(req, res, id) {
  Promise.resolve(repo(req).updateBoard(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Board not found' } }));
}

function deleteBoard(req, res, id) {
  Promise.resolve(repo(req).deleteBoard(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Board not found' } }));
}

// --- Groups ---
function listGroups(req, res, boardId) {
  Promise.resolve(repo(req).listGroups(tenant(req), boardId))
    .then(data => sendJson(res, 200, { data }));
}

function createGroup(req, res, boardId) {
  Promise.resolve(repo(req).createGroup(tenant(req), boardId, req.body || {}))
    .then(data => sendJson(res, 201, { data }));
}

function updateGroup(req, res, groupId) {
  Promise.resolve(repo(req).updateGroup(tenant(req), groupId, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Group not found' } }));
}

function deleteGroup(req, res, groupId) {
  Promise.resolve(repo(req).deleteGroup(tenant(req), groupId))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Group not found' } }));
}

// --- Items ---
function listItems(req, res, boardId) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { group_id: url.searchParams.get('group_id') || '' };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).listItems(tenant(req), boardId, filters))
    .then(data => sendJson(res, 200, { data }));
}

function getItem(req, res, itemId) {
  Promise.resolve(repo(req).findItemById(tenant(req), itemId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Item not found' } }));
}

function createItem(req, res, boardId) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  const input = { ...req.body, created_by: req.body.created_by || req.user?.email || null };
  Promise.resolve(repo(req).createItem(tenant(req), boardId, input))
    .then(data => sendJson(res, 201, { data }));
}

function updateItem(req, res, itemId) {
  Promise.resolve(repo(req).updateItem(tenant(req), itemId, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Item not found' } }));
}

function deleteItem(req, res, itemId) {
  Promise.resolve(repo(req).deleteItem(tenant(req), itemId))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Item not found' } }));
}

function listSubitems(req, res, parentId) {
  Promise.resolve(repo(req).listSubitems(tenant(req), parentId))
    .then(data => sendJson(res, 200, { data }));
}

// --- Views ---
function listViews(req, res, boardId) {
  Promise.resolve(repo(req).listViews(tenant(req), boardId))
    .then(data => sendJson(res, 200, { data }));
}

function createView(req, res, boardId) {
  Promise.resolve(repo(req).createView(tenant(req), boardId, req.body || {}))
    .then(data => sendJson(res, 201, { data }));
}

function updateView(req, res, viewId) {
  Promise.resolve(repo(req).updateView(tenant(req), viewId, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'View not found' } }));
}

function deleteView(req, res, viewId) {
  Promise.resolve(repo(req).deleteView(tenant(req), viewId))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'View not found' } }));
}

// --- Templates ---
function listTemplates(req, res) {
  Promise.resolve(repo(req).listTemplates(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function createTemplate(req, res) {
  Promise.resolve(repo(req).createTemplate(tenant(req), req.body || {}))
    .then(data => sendJson(res, 201, { data }));
}

module.exports = {
  listBoards, getBoard, createBoard, updateBoard, deleteBoard,
  listGroups, createGroup, updateGroup, deleteGroup,
  listItems, getItem, createItem, updateItem, deleteItem, listSubitems,
  listViews, createView, updateView, deleteView,
  listTemplates, createTemplate
};
