const { makeId, now } = require('../services/id');
const {
  normalizeRoutePlanInput,
  normalizeRouteStopInput,
  optimizeStopOrder,
  summarizeRoute
} = require('../services/routePlanningService');

function createRoutePlanRepository(store) {
  if (store.type === 'json') return createJsonRoutePlanRepository(store);
  if (store.type === 'postgres') return createPostgresRoutePlanRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureRoutes(data) {
  if (!data.routePlans) data.routePlans = [];
  if (!data.routeStops) data.routeStops = [];
  return data;
}

function createJsonRoutePlanRepository(store) {
  return {
    listPlans(tenantId, filters = {}) {
      return ensureRoutes(store.read()).routePlans
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.routeDate || x.routeDate === filters.routeDate)
        .filter(x => !filters.technicianId || x.technicianId === filters.technicianId)
        .sort((a, b) => String(b.routeDate).localeCompare(String(a.routeDate)));
    },
    findPlanById(tenantId, id) {
      return this.listPlans(tenantId).find(x => x.id === id) || null;
    },
    createPlan(tenantId, input) {
      const data = ensureRoutes(store.read());
      const plan = { id: makeId('route'), tenantId, ...normalizeRoutePlanInput(input), createdAt: now(), updatedAt: now() };
      data.routePlans.push(plan);
      store.write(data);
      return plan;
    },
    updatePlan(tenantId, id, input) {
      const data = ensureRoutes(store.read());
      const idx = data.routePlans.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.routePlans[idx] = { ...data.routePlans[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.routePlans[idx];
    },
    listStops(tenantId, routePlanId) {
      return ensureRoutes(store.read()).routeStops
        .filter(x => x.tenantId === tenantId && x.routePlanId === routePlanId)
        .sort((a, b) => Number(a.stopOrder || 0) - Number(b.stopOrder || 0));
    },
    createStop(tenantId, input) {
      const data = ensureRoutes(store.read());
      const stop = { id: makeId('rstop'), tenantId, ...normalizeRouteStopInput(input), createdAt: now(), updatedAt: now() };
      data.routeStops.push(stop);
      store.write(data);
      return stop;
    },
    optimize(tenantId, routePlanId) {
      const data = ensureRoutes(store.read());
      const planIdx = data.routePlans.findIndex(x => x.tenantId === tenantId && x.id === routePlanId);
      if (planIdx === -1) return null;

      const stops = data.routeStops.filter(x => x.tenantId === tenantId && x.routePlanId === routePlanId);
      const optimized = optimizeStopOrder(stops, {
        startLatitude: data.routePlans[planIdx].startLatitude,
        startLongitude: data.routePlans[planIdx].startLongitude
      });
      for (const stop of optimized) {
        const idx = data.routeStops.findIndex(x => x.id === stop.id);
        if (idx !== -1) data.routeStops[idx] = { ...data.routeStops[idx], ...stop, updatedAt: now() };
      }

      const summary = summarizeRoute(optimized);
      data.routePlans[planIdx] = {
        ...data.routePlans[planIdx],
        status: 'optimized',
        totalDistanceMiles: summary.totalDistanceMiles,
        totalDriveMinutes: summary.totalDriveMinutes,
        updatedAt: now()
      };
      store.write(data);
      return { plan: data.routePlans[planIdx], stops: optimized, summary };
    },
    summary(tenantId, routePlanId) {
      const stops = this.listStops(tenantId, routePlanId);
      return summarizeRoute(stops);
    }
  };
}

function createPostgresRoutePlanRepository(store) {
  const planSelect = `SELECT id::text, tenant_id as "tenantId", route_date as "routeDate",
    technician_id::text as "technicianId", territory_id::text as "territoryId", status,
    start_location_name as "startLocationName", start_latitude::float as "startLatitude",
    start_longitude::float as "startLongitude", end_location_name as "endLocationName",
    end_latitude::float as "endLatitude", end_longitude::float as "endLongitude",
    total_distance_miles::float as "totalDistanceMiles", total_drive_minutes as "totalDriveMinutes",
    notes, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM route_plans`;
  const stopSelect = `SELECT id::text, tenant_id as "tenantId", route_plan_id::text as "routePlanId",
    job_id::text as "jobId", customer_id::text as "customerId", appointment_id::text as "appointmentId",
    stop_order as "stopOrder", status, address1, city, state, postal_code as "postalCode",
    latitude::float, longitude::float, scheduled_start as "scheduledStart", scheduled_end as "scheduledEnd",
    service_minutes as "serviceMinutes", drive_minutes_from_previous as "driveMinutesFromPrevious",
    distance_miles_from_previous::float as "distanceMilesFromPrevious", notes, metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM route_stops`;

  return {
    async listPlans(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.routeDate) {
        params.push(filters.routeDate);
        where += ` AND route_date = $${params.length}::date`;
      }
      if (filters.technicianId) {
        params.push(filters.technicianId);
        where += ` AND technician_id = $${params.length}`;
      }
      const result = await store.query(`${planSelect} ${where} ORDER BY route_date DESC`, params);
      return result.rows;
    },
    async findPlanById(tenantId, id) {
      const result = await store.query(`${planSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createPlan(tenantId, input) {
      const x = normalizeRoutePlanInput(input);
      const result = await store.query(
        `INSERT INTO route_plans
         (tenant_id, route_date, technician_id, territory_id, status, start_location_name, start_latitude,
          start_longitude, end_location_name, end_latitude, end_longitude, total_distance_miles,
          total_drive_minutes, notes, metadata)
         VALUES ($1,$2::date,$3::uuid,NULLIF($4,'')::uuid,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
         RETURNING id::text, tenant_id as "tenantId", route_date as "routeDate",
                   technician_id::text as "technicianId", territory_id::text as "territoryId", status,
                   start_location_name as "startLocationName", start_latitude::float as "startLatitude",
                   start_longitude::float as "startLongitude", end_location_name as "endLocationName",
                   end_latitude::float as "endLatitude", end_longitude::float as "endLongitude",
                   total_distance_miles::float as "totalDistanceMiles", total_drive_minutes as "totalDriveMinutes",
                   notes, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.routeDate, x.technicianId, x.territoryId, x.status, x.startLocationName, x.startLatitude,
          x.startLongitude, x.endLocationName, x.endLatitude, x.endLongitude, x.totalDistanceMiles,
          x.totalDriveMinutes, x.notes, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updatePlan(tenantId, id, input) {
      const existing = await this.findPlanById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE route_plans SET status=$3, total_distance_miles=$4, total_drive_minutes=$5, notes=$6,
         metadata=$7::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", route_date as "routeDate",
                   technician_id::text as "technicianId", territory_id::text as "territoryId", status,
                   start_location_name as "startLocationName", start_latitude::float as "startLatitude",
                   start_longitude::float as "startLongitude", end_location_name as "endLocationName",
                   end_latitude::float as "endLatitude", end_longitude::float as "endLongitude",
                   total_distance_miles::float as "totalDistanceMiles", total_drive_minutes as "totalDriveMinutes",
                   notes, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.status, x.totalDistanceMiles || 0, x.totalDriveMinutes || 0, x.notes || '', JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async listStops(tenantId, routePlanId) {
      const result = await store.query(`${stopSelect} WHERE tenant_id = $1 AND route_plan_id = $2 ORDER BY stop_order`, [tenantId, routePlanId]);
      return result.rows;
    },
    async createStop(tenantId, input) {
      const x = normalizeRouteStopInput(input);
      const result = await store.query(
        `INSERT INTO route_stops
         (tenant_id, route_plan_id, job_id, customer_id, appointment_id, stop_order, status, address1, city,
          state, postal_code, latitude, longitude, scheduled_start, scheduled_end, service_minutes,
          drive_minutes_from_previous, distance_miles_from_previous, notes, metadata)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,NULLIF($4,'')::uuid,NULLIF($5,'')::uuid,$6,$7,$8,$9,$10,$11,$12,$13,
                 NULLIF($14,'')::timestamptz,NULLIF($15,'')::timestamptz,$16,$17,$18,$19,$20::jsonb)
         RETURNING id::text, tenant_id as "tenantId", route_plan_id::text as "routePlanId",
                   job_id::text as "jobId", customer_id::text as "customerId", appointment_id::text as "appointmentId",
                   stop_order as "stopOrder", status, address1, city, state, postal_code as "postalCode",
                   latitude::float, longitude::float, scheduled_start as "scheduledStart", scheduled_end as "scheduledEnd",
                   service_minutes as "serviceMinutes", drive_minutes_from_previous as "driveMinutesFromPrevious",
                   distance_miles_from_previous::float as "distanceMilesFromPrevious", notes, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.routePlanId, x.jobId, x.customerId, x.appointmentId, x.stopOrder, x.status, x.address1,
          x.city, x.state, x.postalCode, x.latitude, x.longitude, x.scheduledStart, x.scheduledEnd,
          x.serviceMinutes, x.driveMinutesFromPrevious, x.distanceMilesFromPrevious, x.notes, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async optimize(tenantId, routePlanId) {
      const plan = await this.findPlanById(tenantId, routePlanId);
      if (!plan) return null;
      const stops = await this.listStops(tenantId, routePlanId);
      const optimized = optimizeStopOrder(stops, { startLatitude: plan.startLatitude, startLongitude: plan.startLongitude });
      for (const stop of optimized) {
        await store.query(
          `UPDATE route_stops SET stop_order=$3, drive_minutes_from_previous=$4, distance_miles_from_previous=$5, updated_at=now()
           WHERE tenant_id=$1 AND id=$2`,
          [tenantId, stop.id, stop.stopOrder, stop.driveMinutesFromPrevious, stop.distanceMilesFromPrevious]
        );
      }
      const summary = summarizeRoute(optimized);
      const updatedPlan = await this.updatePlan(tenantId, routePlanId, {
        status: 'optimized',
        totalDistanceMiles: summary.totalDistanceMiles,
        totalDriveMinutes: summary.totalDriveMinutes
      });
      return { plan: updatedPlan, stops: optimized, summary };
    },
    async summary(tenantId, routePlanId) {
      const stops = await this.listStops(tenantId, routePlanId);
      return summarizeRoute(stops);
    }
  };
}

module.exports = { createRoutePlanRepository };
