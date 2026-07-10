const { validationError } = require('../errors/domainError');

const DISPATCH_RECOMMENDATION_STATUSES = ['draft', 'generated', 'accepted', 'rejected', 'expired'];
const DEFAULT_WEIGHTS = { skills: 30, territory: 20, availability: 20, sla: 15, routeLoad: 10, continuity: 5 };

function toArray(value) { if (Array.isArray(value)) return value; if (value === undefined || value === null || value === '') return []; return [value]; }
function normalizeTags(tags = []) { return toArray(tags).map(x => String(x).trim().toLowerCase()).filter(Boolean); }

function normalizeRecommendationRequestInput(input = {}) {
  if (!input.jobId) throw validationError('jobId is required');
  return {
    jobId: input.jobId,
    customerId: input.customerId || '',
    appointmentId: input.appointmentId || '',
    requestedFor: input.requestedFor || new Date().toISOString(),
    serviceType: input.serviceType || '',
    priority: input.priority || 'normal',
    territoryId: input.territoryId || '',
    requiredSkills: normalizeTags(input.requiredSkills),
    preferredTechnicianId: input.preferredTechnicianId || '',
    excludedTechnicianIds: normalizeTags(input.excludedTechnicianIds),
    candidateLimit: Number(input.candidateLimit || 5),
    weights: { ...DEFAULT_WEIGHTS, ...(input.weights || {}) },
    metadata: input.metadata || {}
  };
}

function normalizeCandidateInput(input = {}) {
  if (!input.technicianId) throw validationError('technicianId is required');
  return {
    technicianId: input.technicianId,
    displayName: input.displayName || input.name || input.technicianId,
    territoryIds: normalizeTags(input.territoryIds),
    skillTags: normalizeTags(input.skillTags),
    available: input.available !== false,
    active: input.active !== false,
    currentRouteStops: Number(input.currentRouteStops || 0),
    openJobCount: Number(input.openJobCount || 0),
    currentDistanceMiles: Number(input.currentDistanceMiles || 0),
    sameCustomerHistoryCount: Number(input.sameCustomerHistoryCount || 0),
    nextAvailableAt: input.nextAvailableAt || '',
    metadata: input.metadata || {}
  };
}

function scoreSkillFit(requiredSkills = [], candidateSkills = []) {
  const required = normalizeTags(requiredSkills);
  const candidate = new Set(normalizeTags(candidateSkills));
  if (required.length === 0) return { score: 1, matched: [], missing: [] };
  const matched = required.filter(skill => candidate.has(skill));
  const missing = required.filter(skill => !candidate.has(skill));
  return { score: matched.length / required.length, matched, missing };
}
function scoreTerritoryFit(requiredTerritoryId = '', candidateTerritoryIds = []) {
  if (!requiredTerritoryId) return { score: 0.75, reason: 'No required territory' };
  const hasMatch = normalizeTags(candidateTerritoryIds).includes(String(requiredTerritoryId).toLowerCase());
  return { score: hasMatch ? 1 : 0, reason: hasMatch ? 'Territory match' : 'Outside preferred territory' };
}
function scoreAvailability(candidate = {}) { if (candidate.active === false) return { score: 0, reason: 'Technician inactive' }; if (candidate.available === false) return { score: 0.15, reason: 'Technician unavailable' }; return { score: 1, reason: 'Available' }; }
function scoreSla(priority = 'normal') { const map = { emergency: 1, urgent: 0.9, high: 0.75, normal: 0.5, low: 0.25 }; return map[priority] === undefined ? 0.5 : map[priority]; }
function scoreRouteLoad(candidate = {}) { const stops=Number(candidate.currentRouteStops||0), openJobs=Number(candidate.openJobCount||0), distance=Number(candidate.currentDistanceMiles||0); const penalty=Math.min(0.9,(stops*0.12)+(openJobs*0.06)+(distance*0.01)); return Math.max(0, Math.round((1-penalty)*100)/100); }
function scoreContinuity(candidate = {}) { const h=Number(candidate.sameCustomerHistoryCount||0); if (h<=0) return 0; if (h>=5) return 1; return Math.round((h/5)*100)/100; }

function scoreCandidate(request, candidate) {
  const normalizedRequest = normalizeRecommendationRequestInput(request);
  const normalizedCandidate = normalizeCandidateInput(candidate);
  if (normalizedRequest.excludedTechnicianIds.includes(String(normalizedCandidate.technicianId).toLowerCase())) {
    return { technicianId: normalizedCandidate.technicianId, displayName: normalizedCandidate.displayName, score: 0, eligible: false, reasons: ['Technician is excluded'], breakdown: {} };
  }
  const skills = scoreSkillFit(normalizedRequest.requiredSkills, normalizedCandidate.skillTags);
  const territory = scoreTerritoryFit(normalizedRequest.territoryId, normalizedCandidate.territoryIds);
  const availability = scoreAvailability(normalizedCandidate);
  const sla = scoreSla(normalizedRequest.priority);
  const routeLoad = scoreRouteLoad(normalizedCandidate);
  const continuity = normalizedRequest.customerId ? scoreContinuity(normalizedCandidate) : 0;
  const weights = normalizedRequest.weights;
  const weighted = (skills.score*Number(weights.skills||0))+(territory.score*Number(weights.territory||0))+(availability.score*Number(weights.availability||0))+(sla*Number(weights.sla||0))+(routeLoad*Number(weights.routeLoad||0))+(continuity*Number(weights.continuity||0));
  const totalWeight = Object.values(weights).reduce((sum,value)=>sum+Number(value||0),0)||1;
  const score = Math.round((weighted/totalWeight)*10000)/100;
  const reasons=[];
  if (skills.missing.length) reasons.push(`Missing skills: ${skills.missing.join(', ')}`); else if (skills.matched.length) reasons.push(`Matched skills: ${skills.matched.join(', ')}`);
  reasons.push(territory.reason); reasons.push(availability.reason); if (routeLoad>=0.75) reasons.push('Light route load'); if (continuity>0) reasons.push('Prior customer continuity');
  return { technicianId: normalizedCandidate.technicianId, displayName: normalizedCandidate.displayName, score, eligible: normalizedCandidate.active !== false && availability.score > 0 && skills.score > 0, reasons, breakdown: { skills, territory, availability, sla, routeLoad, continuity, weights } };
}
function rankDispatchCandidates(request, candidates = []) { const normalizedRequest=normalizeRecommendationRequestInput(request); return candidates.map(c=>scoreCandidate(normalizedRequest,c)).filter(r=>r.eligible).sort((a,b)=>b.score-a.score).slice(0, normalizedRequest.candidateLimit); }
function normalizeRecommendationResult(input = {}) {
  if (!input.requestId) throw validationError('requestId is required'); if (!input.jobId) throw validationError('jobId is required');
  const status=input.status||'generated'; if (!DISPATCH_RECOMMENDATION_STATUSES.includes(status)) throw validationError(`Unsupported recommendation status: ${status}`);
  return { requestId: input.requestId, jobId: input.jobId, status, candidates: Array.isArray(input.candidates)?input.candidates:[], selectedTechnicianId: input.selectedTechnicianId||'', acceptedBy: input.acceptedBy||'', acceptedAt: input.acceptedAt||'', rejectedReason: input.rejectedReason||'', generatedAt: input.generatedAt||new Date().toISOString(), metadata: input.metadata||{} };
}
module.exports = { DISPATCH_RECOMMENDATION_STATUSES, DEFAULT_WEIGHTS, normalizeTags, normalizeRecommendationRequestInput, normalizeCandidateInput, scoreSkillFit, scoreTerritoryFit, scoreAvailability, scoreSla, scoreRouteLoad, scoreContinuity, scoreCandidate, rankDispatchCandidates, normalizeRecommendationResult };
