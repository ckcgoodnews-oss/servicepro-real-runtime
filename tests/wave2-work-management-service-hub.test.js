/**
 * Wave 2: Work Management Platform + Wave 3: Customer Service Hub Tests
 * Tests: Boards, Groups, Items, Views, Templates, Tickets, SLA, Comments
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');

const TENANT_ID = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    console.error(`  \u2717 ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('Wave 2: Work Management Platform');
console.log('================================');

// --- Boards ---
console.log('\n  Boards');

let testBoardId;
test('creates a board with default columns', () => {
  const board = repos.boards.createBoard(TENANT_ID, { name: 'Project Tasks', board_type: 'main' });
  assert(board.id, 'should have id');
  assert.strictEqual(board.name, 'Project Tasks');
  assert(board.columns.length >= 4, 'should have default columns');
  assert.strictEqual(board.columns[0].type, 'status');
  testBoardId = board.id;
});

test('lists boards scoped to tenant', () => {
  repos.boards.createBoard('other_tenant_board', { name: 'Other Board' });
  const list = repos.boards.listBoards(TENANT_ID, {});
  assert(list.length >= 1);
  assert(list.every(b => b.tenantId === TENANT_ID), 'tenant isolation');
});

test('updates board columns', () => {
  const newCols = [
    { id: 'status', name: 'Status', type: 'status', position: 0, settings: {} },
    { id: 'owner', name: 'Owner', type: 'person', position: 1, settings: {} },
    { id: 'due', name: 'Due Date', type: 'date', position: 2, settings: {} },
    { id: 'effort', name: 'Effort', type: 'number', position: 3, settings: { unit: 'hours' } }
  ];
  const updated = repos.boards.updateBoard(TENANT_ID, testBoardId, { columns: newCols });
  assert.strictEqual(updated.columns.length, 4);
  assert.strictEqual(updated.columns[3].id, 'effort');
});

// --- Groups ---
console.log('\n  Groups');

let testGroupId;
test('creates groups on a board', () => {
  const g1 = repos.boards.createGroup(TENANT_ID, testBoardId, { name: 'To Do', color: '#579bfc' });
  const g2 = repos.boards.createGroup(TENANT_ID, testBoardId, { name: 'In Progress', color: '#fdab3d' });
  const g3 = repos.boards.createGroup(TENANT_ID, testBoardId, { name: 'Done', color: '#00c875' });
  assert(g1.id && g2.id && g3.id);
  testGroupId = g1.id;
});

test('lists groups in order', () => {
  const groups = repos.boards.listGroups(TENANT_ID, testBoardId);
  assert.strictEqual(groups.length, 3);
  assert(groups[0].position <= groups[1].position);
});

// --- Items ---
console.log('\n  Items');

let testItemId;
test('creates items in a group', () => {
  const item = repos.boards.createItem(TENANT_ID, testBoardId, {
    name: 'Design mockups', group_id: testGroupId,
    column_values: { status: 'working', person: 'alice', priority: 'high' }
  });
  assert(item.id);
  assert.strictEqual(item.name, 'Design mockups');
  assert.strictEqual(item.columnValues.status, 'working');
  testItemId = item.id;
});

test('updates item column values (merge semantics)', () => {
  const updated = repos.boards.updateItem(TENANT_ID, testItemId, {
    column_values: { status: 'done', date: '2026-08-10' }
  });
  assert.strictEqual(updated.columnValues.status, 'done');
  assert.strictEqual(updated.columnValues.date, '2026-08-10');
  assert.strictEqual(updated.columnValues.person, 'alice'); // preserved
});

test('creates subitems', () => {
  const sub = repos.boards.createItem(TENANT_ID, testBoardId, {
    name: 'Desktop layout', parent_id: testItemId, column_values: { status: 'working' }
  });
  assert(sub.id);
  const subs = repos.boards.listSubitems(TENANT_ID, testItemId);
  assert.strictEqual(subs.length, 1);
  assert.strictEqual(subs[0].name, 'Desktop layout');
});

test('lists items excluding subitems', () => {
  const items = repos.boards.listItems(TENANT_ID, testBoardId, {});
  assert(items.every(i => !i.parentId), 'top-level only');
});

// --- Views ---
console.log('\n  Views');

test('creates multiple views for a board', () => {
  repos.boards.createView(TENANT_ID, testBoardId, { name: 'Table', view_type: 'table', is_default: true });
  repos.boards.createView(TENANT_ID, testBoardId, { name: 'Kanban', view_type: 'kanban', settings: { group_by: 'status' } });
  repos.boards.createView(TENANT_ID, testBoardId, { name: 'Calendar', view_type: 'calendar', settings: { date_column: 'due' } });
  const views = repos.boards.listViews(TENANT_ID, testBoardId);
  assert.strictEqual(views.length, 3);
  assert(views.some(v => v.viewType === 'kanban'));
});

test('updates view settings', () => {
  const views = repos.boards.listViews(TENANT_ID, testBoardId);
  const kanban = views.find(v => v.viewType === 'kanban');
  const updated = repos.boards.updateView(TENANT_ID, kanban.id, { settings: { group_by: 'priority' } });
  assert.strictEqual(updated.settings.group_by, 'priority');
});

// --- Templates ---
console.log('\n  Templates');

test('creates a board template', () => {
  const tmpl = repos.boards.createTemplate(TENANT_ID, {
    name: 'Sales Pipeline Board', category: 'sales',
    columns: [
      { id: 'stage', name: 'Stage', type: 'status' },
      { id: 'deal_value', name: 'Value', type: 'number' },
      { id: 'close_date', name: 'Close Date', type: 'date' }
    ],
    groups: [{ name: 'Qualified' }, { name: 'Proposal' }, { name: 'Negotiation' }]
  });
  assert(tmpl.id);
  assert.strictEqual(tmpl.category, 'sales');
});

// --- Board deletion cascade ---
test('deleting board removes groups, items, and views', () => {
  const board = repos.boards.createBoard(TENANT_ID, { name: 'Temp Board' });
  repos.boards.createGroup(TENANT_ID, board.id, { name: 'G1' });
  repos.boards.createItem(TENANT_ID, board.id, { name: 'I1' });
  repos.boards.createView(TENANT_ID, board.id, { name: 'V1', view_type: 'table' });
  repos.boards.deleteBoard(TENANT_ID, board.id);
  assert.strictEqual(repos.boards.listGroups(TENANT_ID, board.id).length, 0);
  assert.strictEqual(repos.boards.listItems(TENANT_ID, board.id, {}).length, 0);
  assert.strictEqual(repos.boards.listViews(TENANT_ID, board.id).length, 0);
});

console.log('\n\nWave 3: Customer Service Hub');
console.log('============================');

// --- Tickets ---
console.log('\n  Tickets');

let testTicketId;
test('creates a ticket', () => {
  const ticket = repos.tickets.create(TENANT_ID, {
    subject: 'AC unit not cooling', priority: 'high',
    category: 'equipment', channel: 'portal',
    customer_id: 'cust-001', equipment_id: 'equip-001'
  });
  assert(ticket.id);
  assert(ticket.ticketNumber > 0);
  assert.strictEqual(ticket.subject, 'AC unit not cooling');
  assert.strictEqual(ticket.priority, 'high');
  assert.strictEqual(ticket.status, 'new');
  testTicketId = ticket.id;
});

test('updates ticket status and assignment', () => {
  const updated = repos.tickets.update(TENANT_ID, testTicketId, {
    status: 'in_progress', assigned_to: 'tech-001', assigned_team: 'hvac-team'
  });
  assert.strictEqual(updated.status, 'in_progress');
  assert.strictEqual(updated.assignedTo, 'tech-001');
});

test('resolving ticket sets resolvedAt', () => {
  const ticket = repos.tickets.create(TENANT_ID, { subject: 'Leak repair needed', priority: 'urgent' });
  const resolved = repos.tickets.update(TENANT_ID, ticket.id, { status: 'resolved', resolution_notes: 'Fixed the valve' });
  assert(resolved.resolvedAt, 'should set resolvedAt');
  assert.strictEqual(resolved.resolutionNotes, 'Fixed the valve');
});

test('filters tickets by status and priority', () => {
  repos.tickets.create(TENANT_ID, { subject: 'Low priority issue', priority: 'low' });
  const highPriority = repos.tickets.list(TENANT_ID, { priority: 'high' });
  assert(highPriority.every(t => t.priority === 'high'));
  const inProgress = repos.tickets.list(TENANT_ID, { status: 'in_progress' });
  assert(inProgress.every(t => t.status === 'in_progress'));
});

test('tenant isolation on tickets', () => {
  repos.tickets.create('other_ticket_tenant', { subject: 'Isolated ticket' });
  const list = repos.tickets.list(TENANT_ID, {});
  assert(!list.some(t => t.tenantId === 'other_ticket_tenant'));
});

// --- Comments ---
console.log('\n  Ticket Comments');

test('adds agent and customer comments', () => {
  const agentComment = repos.tickets.addComment(TENANT_ID, testTicketId, {
    author_id: 'agent-001', author_type: 'agent', content: 'Looking into this now'
  });
  assert(agentComment.id);
  assert.strictEqual(agentComment.authorType, 'agent');

  const customerComment = repos.tickets.addComment(TENANT_ID, testTicketId, {
    author_id: 'customer-001', author_type: 'customer', content: 'Thanks for the update'
  });
  assert.strictEqual(customerComment.authorType, 'customer');
});

test('adds internal notes (not visible to customer)', () => {
  repos.tickets.addComment(TENANT_ID, testTicketId, {
    author_id: 'agent-001', author_type: 'agent', content: 'Need to order parts',
    is_internal: true
  });
  const allComments = repos.tickets.listComments(TENANT_ID, testTicketId, true);
  const publicComments = repos.tickets.listComments(TENANT_ID, testTicketId, false);
  assert(allComments.length > publicComments.length, 'internal notes filtered');
});

test('records first response time', () => {
  const ticket = repos.tickets.create(TENANT_ID, { subject: 'Response time test' });
  assert(!ticket.firstResponseAt);
  repos.tickets.recordFirstResponse(TENANT_ID, ticket.id);
  const updated = repos.tickets.findById(TENANT_ID, ticket.id);
  assert(updated.firstResponseAt, 'should record first response');
});

// --- Pipelines ---
console.log('\n  Ticket Pipelines');

test('creates a ticket pipeline with statuses', () => {
  const pipeline = repos.tickets.createPipeline(TENANT_ID, { name: 'Technical Support' });
  assert(pipeline.id);
  assert(pipeline.statuses.length >= 4);
  assert(pipeline.statuses.some(s => s.category === 'open'));
  assert(pipeline.statuses.some(s => s.category === 'closed'));
});

// --- SLA Policies ---
console.log('\n  SLA Policies');

test('creates an SLA policy with priority targets', () => {
  const sla = repos.tickets.createSlaPolicy(TENANT_ID, { name: 'Premium SLA' });
  assert(sla.id);
  assert(sla.priorityTargets.urgent);
  assert.strictEqual(sla.priorityTargets.urgent.first_response_minutes, 15);
  assert(sla.businessHours.monday);
});

test('lists SLA policies for tenant', () => {
  repos.tickets.createSlaPolicy(TENANT_ID, { name: 'Standard SLA' });
  const policies = repos.tickets.listSlaPolicies(TENANT_ID);
  assert(policies.length >= 2);
});

// --- Metrics ---
console.log('\n  Ticket Metrics');

test('generates ticket metrics', () => {
  const metrics = repos.tickets.metrics(TENANT_ID);
  assert(metrics.total > 0);
  assert(typeof metrics.open === 'number');
  assert(metrics.byStatus);
  assert(metrics.byPriority);
});

console.log('\n================================');
console.log('Wave 2 + Wave 3 tests complete.');
