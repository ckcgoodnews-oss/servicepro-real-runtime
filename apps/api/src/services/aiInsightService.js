'use strict';

/**
 * AI Insight Service — Wave 6
 *
 * Generates tenant-isolated, explainable insights from operational data.
 * Rules-based + heuristic engine. Does NOT call external AI APIs directly —
 * it works with existing data to produce actionable recommendations.
 * Can be extended to pass structured context to external AI services.
 *
 * All insights include:
 *  - source_context: the data fingerprint used (for audit)
 *  - confidence: 0.0–1.0
 *  - severity: info | warning | critical
 *  - human_readable summary
 */

// --- Deal Risk Scoring ---
function scoreDealRisk(deal) {
  const risks = [];
  let riskScore = 0;

  // No activity recently (inactivity risk)
  if (deal.updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / 86400000;
    if (daysSinceUpdate > 30) { risks.push('No updates in over 30 days'); riskScore += 0.3; }
    else if (daysSinceUpdate > 14) { risks.push('No updates in over 14 days'); riskScore += 0.15; }
  }

  // Close date overdue
  if (deal.expectedCloseDate) {
    const daysUntilClose = (new Date(deal.expectedCloseDate).getTime() - Date.now()) / 86400000;
    if (daysUntilClose < -14) { risks.push('Close date overdue by more than 2 weeks'); riskScore += 0.35; }
    else if (daysUntilClose < 0) { risks.push('Close date has passed'); riskScore += 0.2; }
    else if (daysUntilClose < 7) { risks.push('Close date within 7 days'); riskScore += 0.05; }
  }

  // Low probability for late stage
  const lateStages = ['proposal', 'negotiation'];
  if (lateStages.includes(deal.stage) && deal.probability != null && deal.probability < 30) {
    risks.push('Low probability for deal stage'); riskScore += 0.2;
  }

  // No value set
  if (!deal.amount || deal.amount === 0) { risks.push('Deal has no value set'); riskScore += 0.1; }

  const confidence = Math.min(riskScore, 1.0);
  const severity = confidence >= 0.6 ? 'critical' : confidence >= 0.3 ? 'warning' : 'info';

  return {
    entity_type: 'deal',
    entity_id: String(deal.id),
    insight_type: 'deal_risk',
    title: risks.length > 0 ? `Deal at risk: ${risks[0]}` : 'Deal on track',
    summary: risks.join('; ') || 'No significant risks detected',
    detail: { risks, stage: deal.stage, amount: deal.amount, daysSinceUpdate: deal.updatedAt ? Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / 86400000) : null },
    confidence,
    severity,
    source_context: { deal_id: deal.id, stage: deal.stage, updated_at: deal.updatedAt, expected_close: deal.expectedCloseDate }
  };
}

// --- Customer Churn Risk ---
function scoreChurnRisk(customer, tickets = [], invoices = [], jobs = []) {
  const risks = [];
  let riskScore = 0;

  // Recent ticket volume spike
  const recentTickets = tickets.filter(t => {
    const days = (Date.now() - new Date(t.createdAt).getTime()) / 86400000;
    return days <= 60;
  });
  if (recentTickets.length >= 5) { risks.push('High ticket volume in last 60 days'); riskScore += 0.25; }
  if (recentTickets.some(t => t.priority === 'urgent')) { risks.push('Recent urgent tickets'); riskScore += 0.2; }

  // Overdue invoices
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  if (overdueInvoices.length >= 2) { risks.push('Multiple overdue invoices'); riskScore += 0.3; }
  else if (overdueInvoices.length === 1) { risks.push('Overdue invoice outstanding'); riskScore += 0.15; }

  // No recent jobs (inactive relationship)
  if (jobs.length > 0) {
    const lastJob = jobs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    const daysSinceLastJob = (Date.now() - new Date(lastJob.createdAt).getTime()) / 86400000;
    if (daysSinceLastJob > 180) { risks.push('No service in over 6 months'); riskScore += 0.2; }
  }

  const confidence = Math.min(riskScore, 1.0);
  const severity = confidence >= 0.5 ? 'critical' : confidence >= 0.25 ? 'warning' : 'info';

  return {
    entity_type: 'customer',
    entity_id: String(customer.id || customer.tenantId),
    insight_type: 'churn_risk',
    title: risks.length > 0 ? `Churn risk detected: ${risks[0]}` : 'Customer relationship healthy',
    summary: risks.join('; ') || 'No churn signals detected',
    detail: { risks, recentTickets: recentTickets.length, overdueInvoices: overdueInvoices.length },
    confidence,
    severity,
    source_context: { customer_id: customer.id, ticket_count: tickets.length, invoice_count: invoices.length }
  };
}

// --- Ticket Routing Suggestion ---
function suggestTicketRouting(ticket, technicians = []) {
  const suggestions = [];

  // Match by category/equipment type
  const categoryKeywords = {
    hvac: ['hvac', 'air conditioning', 'heating', 'cooling', 'furnace'],
    plumbing: ['plumbing', 'pipe', 'leak', 'drain', 'water heater'],
    electrical: ['electrical', 'wiring', 'panel', 'circuit', 'outlet']
  };

  let suggestedTeam = null;
  const subjectLower = (ticket.subject || '').toLowerCase();
  for (const [team, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => subjectLower.includes(kw))) {
      suggestedTeam = team;
      suggestions.push(`Subject suggests ${team} expertise needed`);
      break;
    }
  }

  // Priority escalation
  if (ticket.priority === 'urgent' && !ticket.assignedTo) {
    suggestions.push('Urgent ticket unassigned — immediate assignment needed');
  }

  const confidence = suggestions.length > 0 ? 0.75 : 0.3;
  return {
    entity_type: 'ticket',
    entity_id: String(ticket.id),
    insight_type: 'ticket_routing',
    title: suggestedTeam ? `Route to ${suggestedTeam} team` : 'Review ticket routing',
    summary: suggestions.join('; ') || 'No routing suggestions available',
    detail: { suggestions, suggestedTeam, priority: ticket.priority },
    confidence,
    severity: ticket.priority === 'urgent' ? 'critical' : 'info',
    source_context: { ticket_id: ticket.id, priority: ticket.priority, subject: ticket.subject?.substring(0, 100) }
  };
}

// --- Schedule Optimization ---
function suggestScheduleOptimization(jobs = [], technicians = []) {
  const insights = [];

  // Find unassigned urgent jobs
  const unassignedUrgent = jobs.filter(j => !j.assignedTo && j.priority === 'urgent');
  if (unassignedUrgent.length > 0) {
    insights.push({
      entity_type: 'job',
      entity_id: unassignedUrgent[0].id,
      insight_type: 'schedule_opt',
      title: `${unassignedUrgent.length} urgent jobs unassigned`,
      summary: `${unassignedUrgent.length} high-priority jobs need technician assignment`,
      detail: { count: unassignedUrgent.length, jobIds: unassignedUrgent.map(j => j.id) },
      confidence: 0.95,
      severity: 'critical',
      source_context: { unassigned_urgent_count: unassignedUrgent.length }
    });
  }

  return insights;
}

// --- Next Best Action (Sales) ---
function suggestNextAction(deal, activities = []) {
  const recentActivityDays = activities.length > 0
    ? (Date.now() - new Date(activities[0].performedAt || activities[0].createdAt).getTime()) / 86400000
    : Infinity;

  let action = null;
  let title = '';
  let confidence = 0.6;

  if (recentActivityDays === Infinity) {
    action = 'call'; title = 'No activities recorded — schedule an intro call';
  } else if (recentActivityDays > 7 && deal.stage === 'qualified') {
    action = 'follow_up'; title = 'No activity in 7+ days — send a follow-up';
  } else if (deal.stage === 'proposal' && !activities.some(a => a.activityType === 'meeting')) {
    action = 'meeting'; title = 'Move deal forward with a product demo or site visit';
  } else if (deal.stage === 'negotiation') {
    action = 'call'; title = 'Deal in negotiation — follow up on open items'; confidence = 0.8;
  } else {
    action = 'note'; title = 'Update deal status and add meeting notes'; confidence = 0.4;
  }

  return {
    entity_type: 'deal',
    entity_id: String(deal.id),
    insight_type: 'next_action',
    title,
    summary: `Recommended action: ${action}`,
    detail: { recommended_action: action, stage: deal.stage, days_since_activity: Math.floor(recentActivityDays) },
    confidence,
    severity: recentActivityDays > 14 ? 'warning' : 'info',
    source_context: { deal_id: deal.id, stage: deal.stage, recent_activity_days: Math.floor(recentActivityDays) }
  };
}

module.exports = {
  scoreDealRisk,
  scoreChurnRisk,
  suggestTicketRouting,
  suggestScheduleOptimization,
  suggestNextAction
};
