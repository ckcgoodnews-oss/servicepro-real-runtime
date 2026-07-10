const fs = require('fs');

const required = [
  'apps/api/src/services/routePlanningService.js',
  'apps/api/src/repositories/routePlanRepository.js',
  'apps/api/src/routes/routePlans.js',
  'scripts/seed-route-plans.js',
  'packages/database/postgres/088_route_planning_runtime.sql',
  'docs/sprint88-route-planning-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 88 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeRoutePlanInput,
  normalizeRouteStopInput,
  haversineMiles,
  optimizeStopOrder,
  summarizeRoute
} = require('../apps/api/src/services/routePlanningService');

const plan = normalizeRoutePlanInput({
  routeDate: '2026-07-06',
  technicianId: 'tech1',
  startLatitude: 39.7684,
  startLongitude: -86.1581
});

if (plan.status !== 'draft') {
  console.error('Route plan normalization failed.');
  process.exit(1);
}

const stop = normalizeRouteStopInput({
  routePlanId: 'route1',
  jobId: 'job1',
  latitude: 39.8684,
  longitude: -86.1581,
  serviceMinutes: 90
});

if (stop.serviceMinutes !== 90) {
  console.error('Route stop normalization failed.');
  process.exit(1);
}

const miles = haversineMiles({ latitude: 39.7684, longitude: -86.1581 }, { latitude: 39.8684, longitude: -86.1581 });
if (miles <= 0) {
  console.error('Haversine distance failed.');
  process.exit(1);
}

const optimized = optimizeStopOrder([
  { id: 'far', latitude: 40.0, longitude: -86.1581, serviceMinutes: 30 },
  { id: 'near', latitude: 39.77, longitude: -86.1581, serviceMinutes: 30 }
], { startLatitude: 39.7684, startLongitude: -86.1581 });

if (optimized[0].id !== 'near' || optimized[0].stopOrder !== 1) {
  console.error('Route optimization failed.');
  process.exit(1);
}

const summary = summarizeRoute(optimized);
if (summary.stopCount !== 2 || summary.totalRouteMinutes <= 0) {
  console.error('Route summary failed.');
  process.exit(1);
}

console.log('Sprint 88 route planning runtime patch test passed.');
