'use strict';

async function getJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function renderKpis(summary) {
  const grid = document.querySelector('#kpi-grid');
  const entries = Object.entries(summary.kpis || {});

  grid.innerHTML = entries
    .map(
      ([key, value]) => `
        <article class="kpi-card">
          <span>${key.replace(/([A-Z])/g, ' $1')}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join('');
}

function renderEnvironments(items) {
  const grid = document.querySelector('#environment-grid');

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="environment-card">
          <div class="status-row">
            <strong>${item.environment}</strong>
            <span class="status ${item.health}">
              ${item.health}
            </span>
          </div>
          <p>Release: ${item.currentReleaseId || 'None'}</p>
          <p>Open incidents: ${item.openIncidentCount}</p>
          <p>Rollout: ${item.activeRolloutState || 'None'}</p>
        </article>
      `,
    )
    .join('');
}

function renderTimeline(items) {
  const container = document.querySelector('#timeline');

  container.innerHTML = items
    .map(
      (item) => `
        <article class="timeline-item">
          <time>${item.at || 'Unknown time'}</time>
          <strong>${item.title}</strong>
          <span>
            ${item.environment || 'global'}
            · ${item.releaseId || 'no release'}
          </span>
        </article>
      `,
    )
    .join('');
}

function renderAudit(items) {
  document.querySelector('#audit-results').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Actor</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td>${item.occurred_at || item.occurredAt}</td>
                <td>${item.actor}</td>
                <td>${item.action}</td>
                <td>${item.resource_type || item.resourceType}</td>
                <td>${item.outcome}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function refreshDashboard() {
  const environmentItems = await getJson(
    '/api/release-command-center/environments',
  );
  const timelineItems = await getJson(
    '/api/release-command-center/timeline?limit=100',
  );

  renderEnvironments(environmentItems);
  renderTimeline(timelineItems);
}

async function searchAudit() {
  const actor = document.querySelector('#audit-actor').value;
  const action = document.querySelector('#audit-action').value;
  const query = new URLSearchParams();

  if (actor) {
    query.set('actor', actor);
  }

  if (action) {
    query.set('action', action);
  }

  const items = await getJson(
    `/api/release-command-center/audit?${query}`,
  );

  renderAudit(items);
}

document
  .querySelector('#refresh-button')
  .addEventListener('click', refreshDashboard);

document
  .querySelector('#audit-search')
  .addEventListener('click', searchAudit);

refreshDashboard().catch(console.error);
searchAudit().catch(console.error);
