const { makeId, now } = require('../services/id');

function createBoardRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    // --- Boards ---
    listBoards(tenantId, filters = {}) {
      const d = data();
      d.boards ||= [];
      let results = d.boards.filter(b => b.tenantId === tenantId);
      if (filters.workspace_id) results = results.filter(b => b.workspaceId === filters.workspace_id);
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findBoardById(tenantId, id) {
      const d = data();
      d.boards ||= [];
      return d.boards.find(b => b.tenantId === tenantId && b.id === id) || null;
    },

    createBoard(tenantId, input) {
      const d = data();
      d.boards ||= [];
      const board = {
        id: makeId('board'),
        tenantId,
        workspaceId: input.workspace_id || null,
        name: input.name || 'New Board',
        description: input.description || '',
        boardType: input.board_type || 'main',
        columns: input.columns || [
          { id: 'status', name: 'Status', type: 'status', position: 0, settings: { labels: [{ value: 'working', label: 'Working On It', color: '#fdab3d' }, { value: 'done', label: 'Done', color: '#00c875' }, { value: 'stuck', label: 'Stuck', color: '#e2445c' }] } },
          { id: 'person', name: 'Person', type: 'person', position: 1, settings: {} },
          { id: 'date', name: 'Date', type: 'date', position: 2, settings: {} },
          { id: 'priority', name: 'Priority', type: 'priority', position: 3, settings: { labels: [{ value: 'high', label: 'High', color: '#e2445c' }, { value: 'medium', label: 'Medium', color: '#fdab3d' }, { value: 'low', label: 'Low', color: '#579bfc' }] } }
        ],
        settings: input.settings || {},
        templateId: input.template_id || null,
        ownerId: input.owner_id || null,
        createdAt: now(),
        updatedAt: now()
      };
      d.boards.push(board);
      save(d);
      return board;
    },

    updateBoard(tenantId, id, input) {
      const d = data();
      d.boards ||= [];
      const idx = d.boards.findIndex(b => b.tenantId === tenantId && b.id === id);
      if (idx === -1) return null;
      const board = d.boards[idx];
      if (input.name !== undefined) board.name = input.name;
      if (input.description !== undefined) board.description = input.description;
      if (input.columns !== undefined) board.columns = input.columns;
      if (input.settings !== undefined) board.settings = input.settings;
      board.updatedAt = now();
      save(d);
      return board;
    },

    deleteBoard(tenantId, id) {
      const d = data();
      d.boards ||= [];
      const idx = d.boards.findIndex(b => b.tenantId === tenantId && b.id === id);
      if (idx === -1) return null;
      d.boards.splice(idx, 1);
      // Also remove groups and items
      d.boardGroups = (d.boardGroups || []).filter(g => g.boardId !== id);
      d.boardItems = (d.boardItems || []).filter(i => i.boardId !== id);
      d.boardViews = (d.boardViews || []).filter(v => v.boardId !== id);
      save(d);
      return { deleted: true };
    },

    // --- Groups ---
    listGroups(tenantId, boardId) {
      const d = data();
      d.boardGroups ||= [];
      return d.boardGroups.filter(g => g.tenantId === tenantId && g.boardId === boardId)
        .sort((a, b) => a.position - b.position);
    },

    createGroup(tenantId, boardId, input) {
      const d = data();
      d.boardGroups ||= [];
      const group = {
        id: makeId('group'),
        tenantId,
        boardId,
        name: input.name || 'New Group',
        color: input.color || '#579bfc',
        position: input.position ?? d.boardGroups.filter(g => g.boardId === boardId).length,
        collapsed: false,
        createdAt: now()
      };
      d.boardGroups.push(group);
      save(d);
      return group;
    },

    updateGroup(tenantId, groupId, input) {
      const d = data();
      d.boardGroups ||= [];
      const idx = d.boardGroups.findIndex(g => g.tenantId === tenantId && g.id === groupId);
      if (idx === -1) return null;
      const group = d.boardGroups[idx];
      if (input.name !== undefined) group.name = input.name;
      if (input.color !== undefined) group.color = input.color;
      if (input.position !== undefined) group.position = input.position;
      if (input.collapsed !== undefined) group.collapsed = !!input.collapsed;
      save(d);
      return group;
    },

    deleteGroup(tenantId, groupId) {
      const d = data();
      d.boardGroups ||= [];
      const idx = d.boardGroups.findIndex(g => g.tenantId === tenantId && g.id === groupId);
      if (idx === -1) return null;
      d.boardGroups.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    // --- Items ---
    listItems(tenantId, boardId, filters = {}) {
      const d = data();
      d.boardItems ||= [];
      let results = d.boardItems.filter(i => i.tenantId === tenantId && i.boardId === boardId && !i.parentId);
      if (filters.group_id) results = results.filter(i => i.groupId === filters.group_id);
      return results.sort((a, b) => a.position - b.position);
    },

    listSubitems(tenantId, parentId) {
      const d = data();
      d.boardItems ||= [];
      return d.boardItems.filter(i => i.tenantId === tenantId && i.parentId === parentId)
        .sort((a, b) => a.position - b.position);
    },

    findItemById(tenantId, itemId) {
      const d = data();
      d.boardItems ||= [];
      return d.boardItems.find(i => i.tenantId === tenantId && i.id === itemId) || null;
    },

    createItem(tenantId, boardId, input) {
      const d = data();
      d.boardItems ||= [];
      const item = {
        id: makeId('item'),
        tenantId,
        boardId,
        groupId: input.group_id || null,
        parentId: input.parent_id || null,
        name: input.name || '',
        columnValues: input.column_values || {},
        position: input.position ?? d.boardItems.filter(i => i.boardId === boardId && i.groupId === (input.group_id || null) && !i.parentId).length,
        createdBy: input.created_by || null,
        createdAt: now(),
        updatedAt: now()
      };
      d.boardItems.push(item);
      save(d);
      return item;
    },

    updateItem(tenantId, itemId, input) {
      const d = data();
      d.boardItems ||= [];
      const idx = d.boardItems.findIndex(i => i.tenantId === tenantId && i.id === itemId);
      if (idx === -1) return null;
      const item = d.boardItems[idx];
      if (input.name !== undefined) item.name = input.name;
      if (input.group_id !== undefined) item.groupId = input.group_id;
      if (input.position !== undefined) item.position = input.position;
      if (input.column_values !== undefined) {
        item.columnValues = { ...item.columnValues, ...input.column_values };
      }
      item.updatedAt = now();
      save(d);
      return item;
    },

    deleteItem(tenantId, itemId) {
      const d = data();
      d.boardItems ||= [];
      const idx = d.boardItems.findIndex(i => i.tenantId === tenantId && i.id === itemId);
      if (idx === -1) return null;
      // Remove subitems too
      d.boardItems = d.boardItems.filter(i => i.id !== itemId && i.parentId !== itemId);
      save(d);
      return { deleted: true };
    },

    // --- Views ---
    listViews(tenantId, boardId) {
      const d = data();
      d.boardViews ||= [];
      return d.boardViews.filter(v => v.tenantId === tenantId && v.boardId === boardId);
    },

    createView(tenantId, boardId, input) {
      const d = data();
      d.boardViews ||= [];
      const view = {
        id: makeId('view'),
        tenantId,
        boardId,
        name: input.name || 'New View',
        viewType: input.view_type || 'table',
        settings: input.settings || {},
        isDefault: !!input.is_default,
        createdAt: now()
      };
      d.boardViews.push(view);
      save(d);
      return view;
    },

    updateView(tenantId, viewId, input) {
      const d = data();
      d.boardViews ||= [];
      const idx = d.boardViews.findIndex(v => v.tenantId === tenantId && v.id === viewId);
      if (idx === -1) return null;
      const view = d.boardViews[idx];
      if (input.name !== undefined) view.name = input.name;
      if (input.settings !== undefined) view.settings = input.settings;
      if (input.is_default !== undefined) view.isDefault = !!input.is_default;
      save(d);
      return view;
    },

    deleteView(tenantId, viewId) {
      const d = data();
      d.boardViews ||= [];
      const idx = d.boardViews.findIndex(v => v.tenantId === tenantId && v.id === viewId);
      if (idx === -1) return null;
      d.boardViews.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    // --- Templates ---
    listTemplates(tenantId) {
      const d = data();
      d.boardTemplates ||= [];
      return d.boardTemplates.filter(t => t.tenantId === tenantId || t.isSystem);
    },

    createTemplate(tenantId, input) {
      const d = data();
      d.boardTemplates ||= [];
      const template = {
        id: makeId('tmpl'),
        tenantId,
        name: input.name || '',
        description: input.description || '',
        category: input.category || 'general',
        columns: input.columns || [],
        groups: input.groups || [],
        views: input.views || [],
        isSystem: false,
        createdAt: now()
      };
      d.boardTemplates.push(template);
      save(d);
      return template;
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createBoardRepository };
