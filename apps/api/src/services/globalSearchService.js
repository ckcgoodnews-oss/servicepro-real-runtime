'use strict';

/**
 * Global Search Service — Wave 9
 * Searches across all tenant-owned records: contacts, deals, tickets, jobs, customers, etc.
 * Returns unified results with entity type, ID, title, and match snippet.
 */

function globalSearch(tenantId, query, repositories, options = {}) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const limit = options.limit || 25;
  const entityTypes = options.entity_types || null; // null = search all
  const results = [];

  // Contacts
  if (!entityTypes || entityTypes.includes('contact')) {
    const contacts = repositories.crmContacts?.list(tenantId, {}) || [];
    for (const c of contacts) {
      if (matches(c, q, ['firstName', 'lastName', 'email', 'phone', 'jobTitle'])) {
        results.push({ entity_type: 'contact', entity_id: c.id, title: `${c.firstName || ''} ${c.lastName || ''}`.trim(), subtitle: c.email || '', match_field: findMatchField(c, q, ['firstName', 'lastName', 'email', 'phone']) });
      }
    }
  }

  // Deals
  if (!entityTypes || entityTypes.includes('deal')) {
    const deals = repositories.deals?.list(tenantId, {}) || [];
    for (const d of deals) {
      if (matches(d, q, ['name', 'notes', 'source', 'competitor'])) {
        results.push({ entity_type: 'deal', entity_id: d.id, title: d.name, subtitle: `${d.stage} — $${d.amount || 0}`, match_field: findMatchField(d, q, ['name', 'notes', 'source']) });
      }
    }
  }

  // Tickets
  if (!entityTypes || entityTypes.includes('ticket')) {
    const tickets = repositories.tickets?.list(tenantId, {}) || [];
    for (const t of tickets) {
      if (matches(t, q, ['subject', 'description', 'category'])) {
        results.push({ entity_type: 'ticket', entity_id: t.id, title: t.subject, subtitle: `#${t.ticketNumber} — ${t.status}`, match_field: findMatchField(t, q, ['subject', 'description']) });
      }
    }
  }

  // Tasks
  if (!entityTypes || entityTypes.includes('task')) {
    const tasks = repositories.tasks?.list(tenantId, {}) || [];
    for (const t of tasks) {
      if (matches(t, q, ['title', 'description'])) {
        results.push({ entity_type: 'task', entity_id: t.id, title: t.title, subtitle: t.status, match_field: 'title' });
      }
    }
  }

  // Customers (existing)
  if (!entityTypes || entityTypes.includes('customer')) {
    const customers = repositories.customers?.list?.(tenantId) || [];
    for (const c of customers) {
      if (matches(c, q, ['name', 'email', 'phone', 'address'])) {
        results.push({ entity_type: 'customer', entity_id: c.id, title: c.name || c.email || '', subtitle: c.phone || '', match_field: findMatchField(c, q, ['name', 'email', 'phone']) });
      }
    }
  }

  // Board items
  if (!entityTypes || entityTypes.includes('board_item')) {
    const boards = repositories.boards?.listBoards(tenantId, {}) || [];
    for (const board of boards) {
      const items = repositories.boards.listItems(tenantId, board.id, {}) || [];
      for (const item of items) {
        if (item.name?.toLowerCase().includes(q)) {
          results.push({ entity_type: 'board_item', entity_id: item.id, title: item.name, subtitle: board.name, match_field: 'name' });
        }
      }
    }
  }

  // Sort by relevance (title exact match first, then partial)
  results.sort((a, b) => {
    const aExact = a.title?.toLowerCase() === q ? 0 : 1;
    const bExact = b.title?.toLowerCase() === q ? 0 : 1;
    return aExact - bExact;
  });

  return results.slice(0, limit);
}

function matches(obj, query, fields) {
  for (const field of fields) {
    if (obj[field] && String(obj[field]).toLowerCase().includes(query)) return true;
  }
  return false;
}

function findMatchField(obj, query, fields) {
  for (const field of fields) {
    if (obj[field] && String(obj[field]).toLowerCase().includes(query)) return field;
  }
  return null;
}

module.exports = { globalSearch };
