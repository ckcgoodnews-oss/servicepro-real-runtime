const fs = require('fs');
const required = ['apps/api/src/services/aiDispatchService.js','apps/api/src/repositories/aiDispatchRepository.js','apps/api/src/routes/aiDispatch.js','scripts/seed-ai-dispatch.js','packages/database/postgres/094_ai_dispatch_runtime.sql','docs/sprint94-ai-dispatch-runtime.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 94 patch file: ${file}`); process.exit(1); } }
const { normalizeRecommendationRequestInput, normalizeCandidateInput, scoreSkillFit, scoreTerritoryFit, scoreRouteLoad, scoreCandidate, rankDispatchCandidates } = require('../apps/api/src/services/aiDispatchService');
const request = normalizeRecommendationRequestInput({ jobId:'job1', customerId:'cust1', priority:'urgent', territoryId:'north', requiredSkills:['HVAC','Diagnostics'] });
if (request.requiredSkills[0] !== 'hvac') { console.error('Request normalization failed.'); process.exit(1); }
const candidate = normalizeCandidateInput({ technicianId:'tech1', territoryIds:['north'], skillTags:['hvac','diagnostics'], currentRouteStops:1, openJobCount:1, sameCustomerHistoryCount:3 });
const skill = scoreSkillFit(request.requiredSkills, candidate.skillTags);
if (skill.score !== 1 || skill.missing.length !== 0) { console.error('Skill scoring failed.'); process.exit(1); }
const territory = scoreTerritoryFit('north', candidate.territoryIds);
if (territory.score !== 1) { console.error('Territory scoring failed.'); process.exit(1); }
const routeLoad = scoreRouteLoad(candidate);
if (routeLoad <= 0 || routeLoad > 1) { console.error('Route load scoring failed.'); process.exit(1); }
const scored = scoreCandidate(request, candidate);
if (!scored.eligible || scored.score <= 80) { console.error('Candidate scoring failed.'); process.exit(1); }
const ranked = rankDispatchCandidates(request, [candidate, { technicianId:'tech2', territoryIds:['south'], skillTags:['plumbing'], available:true }]);
if (ranked.length !== 1 || ranked[0].technicianId !== 'tech1') { console.error('Candidate ranking failed.'); process.exit(1); }
console.log('Sprint 94 AI dispatch runtime patch test passed.');
