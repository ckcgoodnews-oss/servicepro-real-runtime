'use client';

import {useCallback, useEffect, useState} from 'react';
import {authFetch} from '@/auth/session';

type TeamUser = {
  id: string;
  name?: string;
  email: string;
  roles: string[];
  modulePermissions: string[];
};

type TeamData = {
  users: TeamUser[];
  enabledModules: string[];
};

export function TeamManagementWorkspace() {
  const [data, setData] = useState<TeamData>({users: [], enabledModules: []});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await authFetch('/api/v1/team');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Unable to load team access');
      setData(body.data);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load team access');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleModule(userId: string, moduleName: string, checked: boolean) {
    setData(current => ({
      ...current,
      users: current.users.map(user => {
        if (user.id !== userId) return user;
        const permissions = user.modulePermissions || [];
        return {
          ...user,
          modulePermissions: checked
            ? Array.from(new Set([...permissions, moduleName]))
            : permissions.filter(permission => permission !== moduleName)
        };
      })
    }));
  }

  async function save(user: TeamUser) {
    const response = await authFetch(`/api/v1/team/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({roles: user.roles, modules: user.modulePermissions})
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error?.message || 'Unable to save access');
      return;
    }
    await load();
  }

  return (
    <section className="panel">
      <h2>Team roles and modules</h2>
      {error && <p className="form-error">{error}</p>}
      {data.users.map(user => (
        <article key={user.id}>
          <strong>{user.name || user.email}</strong>
          {data.enabledModules.map(moduleName => (
            <label key={moduleName}>
              <input
                type="checkbox"
                checked={(user.modulePermissions || []).includes(moduleName)}
                onChange={event => toggleModule(user.id, moduleName, event.target.checked)}
              />
              {moduleName}
            </label>
          ))}
          <button onClick={() => void save(user)}>Save access</button>
        </article>
      ))}
    </section>
  );
}
