'use client';

import { useState } from 'react';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  unitCost: number;
  lastRestocked: string;
};

const DEMO_ITEMS: InventoryItem[] = [
  { id: 'i1', sku: 'CPR-001', name: '1/2" Copper Pipe (10ft)', category: 'Plumbing', quantity: 45, minStock: 20, location: 'Warehouse A', unitCost: 12.50, lastRestocked: '2026-07-15' },
  { id: 'i2', sku: 'FLT-010', name: 'HVAC Air Filter 20x25', category: 'HVAC', quantity: 8, minStock: 15, location: 'Warehouse A', unitCost: 8.99, lastRestocked: '2026-07-01' },
  { id: 'i3', sku: 'VLV-005', name: 'Ball Valve 3/4"', category: 'Plumbing', quantity: 32, minStock: 10, location: 'Truck #1', unitCost: 15.00, lastRestocked: '2026-07-20' },
  { id: 'i4', sku: 'WIR-020', name: '14/2 Romex Wire (250ft)', category: 'Electrical', quantity: 3, minStock: 5, location: 'Warehouse B', unitCost: 89.00, lastRestocked: '2026-06-28' },
  { id: 'i5', sku: 'REF-002', name: 'R-410A Refrigerant (25lb)', category: 'HVAC', quantity: 6, minStock: 4, location: 'Warehouse A', unitCost: 145.00, lastRestocked: '2026-07-10' },
  { id: 'i6', sku: 'DRN-003', name: 'Drain Snake 50ft', category: 'Tools', quantity: 2, minStock: 3, location: 'Truck #2', unitCost: 65.00, lastRestocked: '2026-06-15' },
  { id: 'i7', sku: 'THM-001', name: 'Smart Thermostat (WiFi)', category: 'HVAC', quantity: 12, minStock: 5, location: 'Warehouse A', unitCost: 125.00, lastRestocked: '2026-07-18' },
  { id: 'i8', sku: 'SLD-001', name: 'Lead-Free Solder (1lb)', category: 'Plumbing', quantity: 18, minStock: 8, location: 'Truck #1', unitCost: 22.00, lastRestocked: '2026-07-12' },
];

export function InventoryDashboard() {
  const [items] = useState(DEMO_ITEMS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = items.filter(i =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!categoryFilter || i.category === categoryFilter)
  );

  const lowStock = items.filter(i => i.quantity <= i.minStock);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{items.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>Total Items</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ea4335' }}>{lowStock.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>Low Stock Alerts</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34a853' }}>${totalValue.toLocaleString()}</p>
          <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>Total Value</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{categories.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>Categories</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div style={{ background: '#fce8e6', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '0.75rem' }}>
          <strong style={{ fontSize: '0.85rem', color: '#c5221f' }}>⚠ Low Stock: </strong>
          <span style={{ fontSize: '0.85rem', color: '#5f6368' }}>{lowStock.map(i => i.name).join(', ')}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.85rem', minWidth: '250px' }} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.85rem' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Item</button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Qty</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Min</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Unit Cost</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.sku}</td>
                <td style={{ padding: '0.5rem 0.6rem', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{item.category}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600, color: item.quantity <= item.minStock ? '#ea4335' : '#202124' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#9e9e9e' }}>{item.minStock}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{item.location}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>${item.unitCost.toFixed(2)}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: item.quantity <= item.minStock ? '#fce8e622' : '#e6f4ea', color: item.quantity <= item.minStock ? '#ea4335' : '#34a853' }}>
                    {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
