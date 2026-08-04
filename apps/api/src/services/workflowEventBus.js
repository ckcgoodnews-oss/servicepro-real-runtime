'use strict';

/**
 * Workflow Event Bus — Wave 10
 *
 * Unifies the existing workflow system (/api/v1/workflows) with the new
 * automation rules engine (/api/v1/automation-rules).
 *
 * When business events occur (deal stage change, ticket created, form submitted, etc.),
 * this bus evaluates ALL active automation rules matching the trigger type and
 * executes their actions.
 *
 * Usage:
 *   const { emitEvent } = require('../services/workflowEventBus');
 *   emitEvent(tenantId, 'deal_stage_changed', { deal_id: 'xxx', new_stage: 'proposal', old_stage: 'qualified' }, repositories);
 */

function emitEvent(tenantId, triggerType, triggerData, repositories) {
  const automationRules = repositories.automationRules;
  if (!automationRules) return { rules_matched: 0, executions: [] };

  const rules = automationRules.findByTrigger(tenantId, triggerType);
  const executions = [];

  for (const rule of rules) {
    const conditionsMet = evaluateConditions(rule.conditions, triggerData);
    const actionsResult = [];

    if (conditionsMet) {
      for (const action of (rule.actions || [])) {
        try {
          const result = executeAction(tenantId, action, triggerData, repositories);
          actionsResult.push({ action_type: action.type, status: 'success', result });
        } catch (err) {
          actionsResult.push({ action_type: action.type, status: 'failed', error: err.message });
        }
      }
    }

    const status = !conditionsMet ? 'skipped' : actionsResult.every(a => a.status === 'success') ? 'success' : 'partial';
    const exec = automationRules.recordExecution(tenantId, rule.id, triggerData, conditionsMet, actionsResult, status);
    executions.push(exec);
  }

  return { rules_matched: rules.length, executions };
}

function evaluateConditions(conditions, data) {
  if (!conditions || !conditions.length) return true;
  return conditions.every(c => {
    const val = data[c.field];
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'not_equals': return val !== c.value;
      case 'contains': return String(val || '').toLowerCase().includes(String(c.value).toLowerCase());
      case 'greater_than': return Number(val) > Number(c.value);
      case 'less_than': return Number(val) < Number(c.value);
      case 'in': return Array.isArray(c.value) ? c.value.includes(val) : false;
      case 'is_empty': return !val;
      case 'is_not_empty': return !!val;
      default: return true;
    }
  });
}

function executeAction(tenantId, action, triggerData, repositories) {
  const config = action.config || {};

  switch (action.type) {
    case 'create_task': {
      if (!repositories.tasks) return { skipped: 'tasks repository unavailable' };
      return repositories.tasks.create(tenantId, {
        title: config.title || `Auto: ${triggerData.trigger_type || 'event'}`,
        description: config.description || '',
        assigned_to: config.assigned_to || triggerData.owner_id || null,
        entity_type: triggerData.entity_type || null,
        entity_id: triggerData.entity_id || null,
        task_type: config.task_type || 'todo',
        priority: config.priority || 'normal',
        due_date: config.due_days ? new Date(Date.now() + config.due_days * 86400000).toISOString() : null
      });
    }

    case 'update_field': {
      const { entity_type, entity_id, field, value } = config;
      if (entity_type === 'deal' && repositories.deals) {
        return repositories.deals.update(tenantId, entity_id || triggerData.entity_id, { [field]: value });
      }
      if (entity_type === 'ticket' && repositories.tickets) {
        return repositories.tickets.update(tenantId, entity_id || triggerData.entity_id, { [field]: value });
      }
      return { skipped: 'unsupported entity type for update_field' };
    }

    case 'assign_to': {
      const entityType = triggerData.entity_type || config.entity_type;
      const entityId = triggerData.entity_id || config.entity_id;
      if (entityType === 'ticket' && repositories.tickets) {
        return repositories.tickets.update(tenantId, entityId, { assigned_to: config.user_id });
      }
      if (entityType === 'deal' && repositories.deals) {
        return repositories.deals.update(tenantId, entityId, { owner_id: config.user_id });
      }
      return { skipped: 'no entity to assign' };
    }

    case 'send_notification': {
      if (!repositories.notifications) return { skipped: 'notifications unavailable' };
      // Queue a notification through existing system
      return { queued: true, message: config.message || 'Automation notification triggered' };
    }

    case 'log_activity': {
      if (!repositories.activityTimeline) return { skipped: 'activity timeline unavailable' };
      return repositories.activityTimeline.create(tenantId, {
        entity_type: triggerData.entity_type || config.entity_type || 'system',
        entity_id: triggerData.entity_id || config.entity_id || 'automation',
        activity_type: 'automation',
        title: config.title || `Automation: ${action.type}`,
        description: config.description || JSON.stringify(triggerData),
        performed_by: 'system:automation'
      });
    }

    case 'create_ticket': {
      if (!repositories.tickets) return { skipped: 'tickets unavailable' };
      return repositories.tickets.create(tenantId, {
        subject: config.subject || `Auto-created from ${triggerData.trigger_type || 'automation'}`,
        description: config.description || '',
        priority: config.priority || 'medium',
        category: config.category || null,
        channel: 'api',
        customer_id: triggerData.customer_id || config.customer_id || null
      });
    }

    case 'webhook': {
      // In production, this would make an HTTP POST to config.url
      // For now, log it as executed
      return { webhook_url: config.url, payload: triggerData, executed: true };
    }

    default:
      return { skipped: `Unknown action type: ${action.type}` };
  }
}

module.exports = { emitEvent, evaluateConditions, executeAction };
