const { validationError } = require('../errors/domainError');

const ROUTE_STATUSES = ['draft', 'optimized', 'locked', 'in_progress', 'completed', 'cancelled'];
const STOP_STATUSES = ['planned', 'en_route', 'arrived', 'completed', 'skipped', 'cancelled'];

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeRoutePlanInput(input = {}) {
  if (!input.routeDate) throw validationError('routeDate is required');
  if (!input.technicianId) throw validationError('technicianId is required');

  const status = input.status || 'draft';
  if (!ROUTE_STATUSES.includes(status)) throw validationError(`Unsupported route status: ${status}`);

  return {
    routeDate: input.routeDate,
    technicianId: input.technicianId,
    territoryId: input.territoryId || '',
    status,
    startLocationName: input.startLocationName || '',
    startLatitude: toNumberOrNull(input.startLatitude),
    startLongitude: toNumberOrNull(input.startLongitude),
    endLocationName: input.endLocationName || '',
    endLatitude: toNumberOrNull(input.endLatitude),
    endLongitude: toNumberOrNull(input.endLongitude),
    totalDistanceMiles: Number(input.totalDistanceMiles || 0),
    totalDriveMinutes: Number(input.totalDriveMinutes || 0),
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function normalizeRouteStopInput(input = {}) {
  if (!input.routePlanId) throw validationError('routePlanId is required');
  if (!input.jobId && !input.customerId) throw validationError('jobId or customerId is required');

  const status = input.status || 'planned';
  if (!STOP_STATUSES.includes(status)) throw validationError(`Unsupported stop status: ${status}`);

  return {
    routePlanId: input.routePlanId,
    jobId: input.jobId || '',
    customerId: input.customerId || '',
    appointmentId: input.appointmentId || '',
    stopOrder: Number(input.stopOrder || 0),
    status,
    address1: input.address1 || '',
    city: input.city || '',
    state: input.state || '',
    postalCode: input.postalCode || '',
    latitude: toNumberOrNull(input.latitude),
    longitude: toNumberOrNull(input.longitude),
    scheduledStart: input.scheduledStart || '',
    scheduledEnd: input.scheduledEnd || '',
    serviceMinutes: Number(input.serviceMinutes || 60),
    driveMinutesFromPrevious: Number(input.driveMinutesFromPrevious || 0),
    distanceMilesFromPrevious: Number(input.distanceMilesFromPrevious || 0),
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function haversineMiles(a, b) {
  if (a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) return 0;
  const r = 3958.7613;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round((2 * r * Math.asin(Math.sqrt(h))) * 100) / 100;
}

function optimizeStopOrder(stops = [], start = {}) {
  const remaining = stops.map((stop, idx) => ({ ...stop, _idx: idx }));
  const ordered = [];
  let current = {
    latitude: toNumberOrNull(start.latitude ?? start.startLatitude),
    longitude: toNumberOrNull(start.longitude ?? start.startLongitude)
  };

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const distance = haversineMiles(current, remaining[i]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push({
      ...next,
      stopOrder: ordered.length + 1,
      distanceMilesFromPrevious: Number.isFinite(bestDistance) ? bestDistance : 0,
      driveMinutesFromPrevious: Math.round((Number.isFinite(bestDistance) ? bestDistance : 0) * 2.2)
    });
    current = next;
  }

  return ordered.map(({ _idx, ...stop }) => stop);
}

function summarizeRoute(stops = []) {
  const totalDistanceMiles = Math.round(stops.reduce((sum, s) => sum + Number(s.distanceMilesFromPrevious || 0), 0) * 100) / 100;
  const totalDriveMinutes = stops.reduce((sum, s) => sum + Number(s.driveMinutesFromPrevious || 0), 0);
  const totalServiceMinutes = stops.reduce((sum, s) => sum + Number(s.serviceMinutes || 0), 0);
  return {
    stopCount: stops.length,
    totalDistanceMiles,
    totalDriveMinutes,
    totalServiceMinutes,
    totalRouteMinutes: totalDriveMinutes + totalServiceMinutes
  };
}

module.exports = {
  ROUTE_STATUSES,
  STOP_STATUSES,
  normalizeRoutePlanInput,
  normalizeRouteStopInput,
  haversineMiles,
  optimizeStopOrder,
  summarizeRoute
};
