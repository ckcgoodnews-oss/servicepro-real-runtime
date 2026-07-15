CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_priority ON jobs (tenant_id, status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_job_window ON appointments (tenant_id, job_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_technician_window ON appointments (tenant_id, technician_id, start_time, end_time) WHERE status <> 'cancelled';
