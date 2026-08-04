const { makeId, now } = require('../services/id');

function createTaskRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.tasks ||= [];
      let results = d.tasks.filter(t => t.tenantId === tenantId);
      if (filters.status) results = results.filter(t => t.status === filters.status);
      if (filters.assigned_to) results = results.filter(t => t.assignedTo === filters.assigned_to);
      if (filters.entity_type && filters.entity_id) {
        results = results.filter(t => t.entityType === filters.entity_type && t.entityId === filters.entity_id);
      }
      if (filters.task_type) results = results.filter(t => t.taskType === filters.task_type);
      if (filters.priority) results = results.filter(t => t.priority === filters.priority);
      return results.sort((a, b) => {
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    },

    findById(tenantId, id) {
      const d = data();
      d.tasks ||= [];
      return d.tasks.find(t => t.tenantId === tenantId && t.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.tasks ||= [];
      const task = {
        id: makeId('task'),
        tenantId,
        title: input.title || '',
        description: input.description || '',
        status: input.status || 'open',
        priority: input.priority || 'normal',
        dueDate: input.due_date || null,
        completedAt: null,
        ownerId: input.owner_id || null,
        assignedTo: input.assigned_to || null,
        entityType: input.entity_type || null,
        entityId: input.entity_id || null,
        taskType: input.task_type || 'todo',
        reminderAt: input.reminder_at || null,
        metadata: input.metadata || {},
        createdAt: now(),
        updatedAt: now()
      };
      d.tasks.push(task);
      save(d);
      return task;
    },

    update(tenantId, id, input) {
      const d = data();
      d.tasks ||= [];
      const idx = d.tasks.findIndex(t => t.tenantId === tenantId && t.id === id);
      if (idx === -1) return null;
      const task = d.tasks[idx];
      if (input.title !== undefined) task.title = input.title;
      if (input.description !== undefined) task.description = input.description;
      if (input.status !== undefined) {
        task.status = input.status;
        if (input.status === 'completed' && !task.completedAt) task.completedAt = now();
      }
      if (input.priority !== undefined) task.priority = input.priority;
      if (input.due_date !== undefined) task.dueDate = input.due_date;
      if (input.assigned_to !== undefined) task.assignedTo = input.assigned_to;
      if (input.entity_type !== undefined) task.entityType = input.entity_type;
      if (input.entity_id !== undefined) task.entityId = input.entity_id;
      if (input.task_type !== undefined) task.taskType = input.task_type;
      if (input.reminder_at !== undefined) task.reminderAt = input.reminder_at;
      if (input.metadata !== undefined) task.metadata = input.metadata;
      task.updatedAt = now();
      save(d);
      return task;
    },

    delete(tenantId, id) {
      const d = data();
      d.tasks ||= [];
      const idx = d.tasks.findIndex(t => t.tenantId === tenantId && t.id === id);
      if (idx === -1) return null;
      d.tasks.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    countByStatus(tenantId) {
      const d = data();
      d.tasks ||= [];
      const counts = {};
      for (const t of d.tasks.filter(t => t.tenantId === tenantId)) {
        counts[t.status] = (counts[t.status] || 0) + 1;
      }
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    },

    overdue(tenantId) {
      const d = data();
      d.tasks ||= [];
      const today = now();
      return d.tasks.filter(t =>
        t.tenantId === tenantId && t.dueDate && t.dueDate < today &&
        t.status !== 'completed' && t.status !== 'cancelled'
      ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createTaskRepository };
