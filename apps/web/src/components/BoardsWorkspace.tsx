'use client';

import { useState, useEffect } from 'react';
import { boardsApi } from '@/lib/api';

type Board = { id: string; name: string; description: string; columns: Column[]; createdAt: string };
type Column = { id: string; name: string; type: string; settings: any };
type Group = { id: string; name: string; color: string; position: number };
type Item = { id: string; name: string; groupId: string | null; columnValues: Record<string, any>; position: number; updatedAt: string };

export function BoardsWorkspace() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemGroup, setNewItemGroup] = useState('');

  useEffect(() => {
    boardsApi.list().then(r => { setBoards((r.data || []) as Board[]); }).finally(() => setLoading(false));
  }, []);

  async function selectBoard(board: Board) {
    setSelectedBoard(board);
    const [g, i] = await Promise.all([
      boardsApi.listGroups(board.id).then(r => (r.data || []) as Group[]),
      boardsApi.listItems(board.id).then(r => (r.data || []) as Item[]),
    ]);
    setGroups(g);
    setItems(i);
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    const result = await boardsApi.create({ name: newBoardName });
    if (result.data) { setBoards(prev => [result.data as Board, ...prev]); setShowCreateBoard(false); setNewBoardName(''); selectBoard(result.data as Board); }
  }

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBoard || !newItemName.trim()) return;
    const result = await boardsApi.createItem(selectedBoard.id, { name: newItemName, group_id: newItemGroup || undefined });
    if (result.data) { setItems(prev => [...prev, result.data as Item]); setNewItemName(''); }
  }

  async function handleColumnValueChange(itemId: string, columnId: string, value: string) {
    const result = await boardsApi.updateItem(itemId, { column_values: { [columnId]: value } });
    if (result.data) setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...result.data as Item } : i));
  }

  const statusColumn = selectedBoard?.columns.find(c => c.type === 'status');
  const statusLabels = statusColumn?.settings?.labels || [
    { value: 'working', label: 'Working', color: '#fdab3d' },
    { value: 'done', label: 'Done', color: '#00c875' },
    { value: 'stuck', label: 'Stuck', color: '#e2445c' },
  ];

  if (loading) return <div className="workspace-loading" aria-busy="true"><p>Loading boards...</p></div>;

  // Board list (no board selected)
  if (!selectedBoard) {
    return (
      <div className="boards-workspace">
        <header className="workspace-header">
          <h1>Work Management</h1>
          <button className="btn-primary" onClick={() => setShowCreateBoard(true)}>+ New Board</button>
        </header>
        <div className="boards-grid" role="list" aria-label="Boards">
          {boards.map(board => (
            <article key={board.id} className="board-card" onClick={() => selectBoard(board)} role="listitem" tabIndex={0} onKeyDown={e => e.key === 'Enter' && selectBoard(board)}>
              <h3>{board.name}</h3>
              <p>{board.description || 'No description'}</p>
              <div className="board-card-meta">{board.columns.length} columns · Created {new Date(board.createdAt).toLocaleDateString()}</div>
            </article>
          ))}
          {boards.length === 0 && <p className="empty-state">No boards yet. Create one to get started.</p>}
        </div>
        {showCreateBoard && (
          <dialog open className="modal" aria-labelledby="create-board-title">
            <form onSubmit={handleCreateBoard}>
              <h2 id="create-board-title">New Board</h2>
              <label>Board Name <input required value={newBoardName} onChange={e => setNewBoardName(e.target.value)} placeholder="e.g. Project Tasks, Sales Pipeline" /></label>
              <div className="modal-actions"><button type="submit" className="btn-primary">Create</button><button type="button" onClick={() => setShowCreateBoard(false)}>Cancel</button></div>
            </form>
          </dialog>
        )}
      </div>
    );
  }

  // Board detail view
  return (
    <div className="boards-workspace">
      <header className="workspace-header">
        <div className="workspace-header-left">
          <button className="btn-back" onClick={() => setSelectedBoard(null)} aria-label="Back to boards">←</button>
          <h1>{selectedBoard.name}</h1>
        </div>
        <div className="workspace-actions">
          <button className="btn-tab" data-active={view === 'table'} onClick={() => setView('table')}>Table</button>
          <button className="btn-tab" data-active={view === 'kanban'} onClick={() => setView('kanban')}>Kanban</button>
        </div>
      </header>

      {/* Table View */}
      {view === 'table' && (
        <div className="board-table-view">
          {groups.length > 0 ? groups.map(group => (
            <section key={group.id} className="board-group" aria-label={`Group: ${group.name}`}>
              <h3 className="board-group-header" style={{ borderLeftColor: group.color }}>{group.name}</h3>
              <table className="data-table" role="grid">
                <thead><tr><th>Item</th>{selectedBoard.columns.map(col => <th key={col.id}>{col.name}</th>)}</tr></thead>
                <tbody>
                  {items.filter(i => i.groupId === group.id).map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      {selectedBoard.columns.map(col => (
                        <td key={col.id}>
                          {col.type === 'status' ? (
                            <select value={item.columnValues[col.id] || ''} onChange={e => handleColumnValueChange(item.id, col.id, e.target.value)} aria-label={`${col.name} for ${item.name}`}>
                              <option value="">—</option>
                              {statusLabels.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          ) : (
                            <input value={item.columnValues[col.id] || ''} onBlur={e => handleColumnValueChange(item.id, col.id, e.target.value)} placeholder="—" aria-label={`${col.name} for ${item.name}`} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )) : (
            <table className="data-table" role="grid">
              <thead><tr><th>Item</th>{selectedBoard.columns.map(col => <th key={col.id}>{col.name}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    {selectedBoard.columns.map(col => (
                      <td key={col.id}>
                        <input value={item.columnValues[col.id] || ''} onBlur={e => handleColumnValueChange(item.id, col.id, e.target.value)} placeholder="—" aria-label={`${col.name} for ${item.name}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <form onSubmit={handleCreateItem} className="add-item-form">
            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="+ Add item" aria-label="New item name" />
            {groups.length > 0 && <select value={newItemGroup} onChange={e => setNewItemGroup(e.target.value)} aria-label="Group">{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>}
            <button type="submit" className="btn-primary" disabled={!newItemName.trim()}>Add</button>
          </form>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && statusColumn && (
        <div className="board-kanban-view" role="region" aria-label="Kanban board">
          {statusLabels.map((status: any) => (
            <div key={status.value} className="kanban-column">
              <div className="kanban-column-header" style={{ backgroundColor: status.color }}>{status.label} ({items.filter(i => i.columnValues[statusColumn.id] === status.value).length})</div>
              <div className="kanban-cards">
                {items.filter(i => i.columnValues[statusColumn.id] === status.value).map(item => (
                  <article key={item.id} className="kanban-card"><h4>{item.name}</h4></article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
