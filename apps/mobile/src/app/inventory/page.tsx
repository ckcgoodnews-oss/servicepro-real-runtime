'use client';

import { MobileShell } from '@/components/MobileShell';
import { useState } from 'react';

const truckParts = [
  { sku: 'VLV-005', name: 'Ball Valve 3/4"', qty: 4, location: 'Bin A3' },
  { sku: 'CPR-001', name: '1/2" Copper Pipe (10ft)', qty: 6, location: 'Rack 1' },
  { sku: 'SLD-001', name: 'Lead-Free Solder (1lb)', qty: 2, location: 'Bin B1' },
  { sku: 'THM-001', name: 'Smart Thermostat (WiFi)', qty: 1, location: 'Bin C2' },
  { sku: 'FLT-010', name: 'HVAC Air Filter 20x25', qty: 3, location: 'Rack 2' },
  { sku: 'DRN-003', name: 'Drain Snake 50ft', qty: 1, location: 'Compartment D' },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const filtered = truckParts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <MobileShell activePath="/inventory" title="Truck Inventory">
      <input type="text" placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }} />

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{filtered.length} items on truck</p>

      {filtered.map(part => (
        <div key={part.sku} className="m-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{part.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{part.sku} • {part.location}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: part.qty <= 1 ? 'var(--danger)' : 'var(--text)' }}>{part.qty}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>in stock</p>
          </div>
        </div>
      ))}

      <button className="m-btn m-btn-outline" style={{ marginTop: '1rem' }}>Request Parts Restock</button>
    </MobileShell>
  );
}
