const { makeId, now } = require('../services/id');

function createTicketRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }
  let ticketCounter = 1000;

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.tickets ||= [];
      let results = d.tickets.filter(t => t.tenantId === tenantId);
      if (filters.status) results = results.filter(t => t.status === filters.status);
      if (filters.priority) results = results.filter(t => t.priority === filters.priority);
      if (filters.assigned_to) results = results.filter(t => t.assignedTo === filters.assigned_to);
      if (filters.customer_id) results = results.filter(t => t.customerId === filters.customer_id);
      if (filters.category) results = results.filter(t => t.category === filters.category);
      if (filters.channel) results = results.filter(t => t.channel === filters.channel);
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.tickets ||= [];
      return d.tickets.find(t => t.tenantId === tenantId && t.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.tickets ||= [];
      ticketCounter++;
      const ticket = {
        id: makeId('ticket'),
        tenantId,
        pipelineId: input.pipeline_id || null,
        ticketNumber: ticketCounter,
        subject: input.subject || '',
        description: input.description || '',
        status: input.status || 'new',
        priority: input.priority || 'medium',
        category: input.category || null,
        channel: input.channel || 'portal',
        customerId: input.customer_id || null,
        contactId: input.contact_id || null,
        companyId: input.company_id || null,
        equipmentId: input.equipment_id || null,
        propertyId: input.property_id || null,
        workOrderId: input.work_order_id || null,
        assignedTo: input.assigned_to || null,
        assignedTeam: input.assigned_team || null,
        slaPolicyId: input.sla_policy_id || null,
        slaBreachAt: null,
        firstResponseAt: null,
        resolvedAt: null,
        closedAt: null,
        satisfactionScore: null,
        resolutionNotes: null,
        rootCause: null,
        tags: input.tags || [],
        properties: input.properties || {},
        createdAt: now(),
        updatedAt: now()
      };
      d.tickets.push(ticket);
      save(d);
      return ticket;
    },

    update(tenantId, id, input) {
      const d = data();
      d.tickets ||= [];
      const idx = d.tickets.findIndex(t => t.tenantId === tenantId && t.id === id);
      if (idx === -1) return null;
      const ticket = d.tickets[idx];
      const updatable = ['subject', 'description', 'status', 'priority', 'category', 'channel', 'assigned_to', 'assigned_team', 'sla_policy_id', 'resolution_notes', 'root_cause', 'satisfaction_score'];
      for (const field of updatable) {
        if (input[field] !== undefined) {
          const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          ticket[camelField] = input[field];
        }
      }
      if (input.tags !== undefined) ticket.tags = input.tags;
      if (input.properties !== undefined) ticket.properties = input.properties;
      if (input.status === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = now();
      if (input.status === 'closed' && !ticket.closedAt) ticket.closedAt = now();
      if (input.customer_id !== undefined) ticket.customerId = input.customer_id;
      if (input.contact_id !== undefined) ticket.contactId = input.contact_id;
      if (input.equipment_id !== undefined) ticket.equipmentId = input.equipment_id;
      if (input.work_order_id !== undefined) ticket.workOrderId = input.work_order_id;
      ticket.updatedAt = now();
      save(d);
      return ticket;
    },

    delete(tenantId, id) {
      const d = data();
      d.tickets ||= [];
      const idx = d.tickets.findIndex(t => t.tenantId === tenantId && t.id === id);
      if (idx === -1) return null;
      d.tickets.splice(idx, 1);
      d.ticketComments = (d.ticketComments || []).filter(c => c.ticketId !== id);
      save(d);
      return { deleted: true };
    },

    recordFirstResponse(tenantId, id) {
      const d = data();
      d.tickets ||= [];
      const ticket = d.tickets.find(t => t.tenantId === tenantId && t.id === id);
      if (!ticket || ticket.firstResponseAt) return ticket;
      ticket.firstResponseAt = now();
      ticket.updatedAt = now();
      save(d);
      return ticket;
    },

    metrics(tenantId) {
      const d = data();
      d.tickets ||= [];
      const tenantTickets = d.tickets.filter(t => t.tenantId === tenantId);
      const byStatus = {};
      const byPriority = {};
      for (const t of tenantTickets) {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      }
      return {
        total: tenantTickets.length,
        open: tenantTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
        byStatus,
        byPriority,
        avgSatisfaction: tenantTickets.filter(t => t.satisfactionScore).reduce((sum, t) => sum + t.satisfactionScore, 0) / (tenantTickets.filter(t => t.satisfactionScore).length || 1)
      };
    },

    // --- Comments ---
    listComments(tenantId, ticketId, includeInternal = true) {
      const d = data();
      d.ticketComments ||= [];
      let results = d.ticketComments.filter(c => c.tenantId === tenantId && c.ticketId === ticketId);
      if (!includeInternal) results = results.filter(c => !c.isInternal);
      return results.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    },

    addComment(tenantId, ticketId, input) {
      const d = data();
      d.ticketComments ||= [];
      const comment = {
        id: makeId('comment'),
        tenantId,
        ticketId,
        authorId: input.author_id || null,
        authorType: input.author_type || 'agent',
        content: input.content || '',
        isInternal: !!input.is_internal,
        attachments: input.attachments || [],
        createdAt: now()
      };
      d.ticketComments.push(comment);
      save(d);
      return comment;
    },

    // --- Pipelines ---
    listPipelines(tenantId) {
      const d = data();
      d.ticketPipelines ||= [];
      return d.ticketPipelines.filter(p => p.tenantId === tenantId);
    },

    createPipeline(tenantId, input) {
      const d = data();
      d.ticketPipelines ||= [];
      const pipeline = {
        id: makeId('tpipe'),
        tenantId,
        name: input.name || 'Support Pipeline',
        isDefault: !!input.is_default,
        statuses: input.statuses || [
          { id: 'new', name: 'New', category: 'open', color: '#579bfc', order: 0 },
          { id: 'in_progress', name: 'In Progress', category: 'open', color: '#fdab3d', order: 1 },
          { id: 'waiting', name: 'Waiting on Customer', category: 'pending', color: '#c4c4c4', order: 2 },
          { id: 'resolved', name: 'Resolved', category: 'closed', color: '#00c875', order: 3 },
          { id: 'closed', name: 'Closed', category: 'closed', color: '#333333', order: 4 }
        ],
        createdAt: now(),
        updatedAt: now()
      };
      d.ticketPipelines.push(pipeline);
      save(d);
      return pipeline;
    },

    // --- SLA Policies ---
    listSlaPolicies(tenantId) {
      const d = data();
      d.slaPolicies ||= [];
      return d.slaPolicies.filter(p => p.tenantId === tenantId);
    },

    createSlaPolicy(tenantId, input) {
      const d = data();
      d.slaPolicies ||= [];
      const policy = {
        id: makeId('sla'),
        tenantId,
        name: input.name || 'Standard SLA',
        description: input.description || '',
        priorityTargets: input.priority_targets || {
          urgent: { first_response_minutes: 15, resolution_minutes: 240 },
          high: { first_response_minutes: 60, resolution_minutes: 480 },
          medium: { first_response_minutes: 240, resolution_minutes: 1440 },
          low: { first_response_minutes: 480, resolution_minutes: 2880 }
        },
        businessHours: input.business_hours || {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        },
        isDefault: !!input.is_default,
        isActive: input.is_active !== false,
        createdAt: now(),
        updatedAt: now()
      };
      d.slaPolicies.push(policy);
      save(d);
      return policy;
    },

    findSlaPolicy(tenantId, id) {
      const d = data();
      d.slaPolicies ||= [];
      return d.slaPolicies.find(p => p.tenantId === tenantId && p.id === id) || null;
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createTicketRepository };
