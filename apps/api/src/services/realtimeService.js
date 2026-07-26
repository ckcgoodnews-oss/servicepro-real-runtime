// Real-time WebSocket service for live updates
// Provides dispatch board updates, notifications, and technician tracking

const EventEmitter = require('events');

class RealtimeService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // connectionId -> { ws, tenantId, userId, channels }
    this.channels = new Map(); // channelName -> Set<connectionId>
  }

  addClient(connectionId, ws, tenantId, userId) {
    this.clients.set(connectionId, { ws, tenantId, userId, channels: new Set() });
    this.subscribe(connectionId, `tenant:${tenantId}`);
    this.subscribe(connectionId, `user:${userId}`);
  }

  removeClient(connectionId) {
    const client = this.clients.get(connectionId);
    if (!client) return;
    for (const channel of client.channels) {
      const subs = this.channels.get(channel);
      if (subs) { subs.delete(connectionId); if (subs.size === 0) this.channels.delete(channel); }
    }
    this.clients.delete(connectionId);
  }

  subscribe(connectionId, channel) {
    const client = this.clients.get(connectionId);
    if (!client) return;
    client.channels.add(channel);
    if (!this.channels.has(channel)) this.channels.set(channel, new Set());
    this.channels.get(channel).add(connectionId);
  }

  unsubscribe(connectionId, channel) {
    const client = this.clients.get(connectionId);
    if (!client) return;
    client.channels.delete(channel);
    const subs = this.channels.get(channel);
    if (subs) { subs.delete(connectionId); if (subs.size === 0) this.channels.delete(channel); }
  }

  // Publish event to a channel
  publish(channel, event, data) {
    const subs = this.channels.get(channel);
    if (!subs) return 0;
    const message = JSON.stringify({ event, data, channel, timestamp: new Date().toISOString() });
    let sent = 0;
    for (const connectionId of subs) {
      const client = this.clients.get(connectionId);
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(message);
        sent++;
      }
    }
    return sent;
  }

  // Publish to all connections for a tenant
  publishToTenant(tenantId, event, data) {
    return this.publish(`tenant:${tenantId}`, event, data);
  }

  // Publish to a specific user
  publishToUser(userId, event, data) {
    return this.publish(`user:${userId}`, event, data);
  }

  // Dispatch-specific events
  dispatchJobAssigned(tenantId, assignment) {
    return this.publishToTenant(tenantId, 'dispatch.job_assigned', assignment);
  }

  dispatchJobStatusChanged(tenantId, jobId, status, technicianId) {
    return this.publishToTenant(tenantId, 'dispatch.status_changed', { jobId, status, technicianId });
  }

  technicianLocationUpdated(tenantId, technicianId, location) {
    return this.publishToTenant(tenantId, 'technician.location', { technicianId, ...location });
  }

  notificationCreated(tenantId, userId, notification) {
    this.publishToUser(userId, 'notification.new', notification);
    return this.publishToTenant(tenantId, 'notification.created', { userId, ...notification });
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      totalChannels: this.channels.size,
      connectionsByTenant: [...this.channels.entries()]
        .filter(([k]) => k.startsWith('tenant:'))
        .map(([k, v]) => ({ tenant: k.replace('tenant:', ''), connections: v.size }))
    };
  }
}

// Singleton
const realtime = new RealtimeService();

module.exports = { realtime, RealtimeService };
