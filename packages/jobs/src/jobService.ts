import { CreateJobInput, Job, JobStatus } from './jobTypes';

export interface JobService {
  listJobs(tenantId: string, filters?: { status?: JobStatus; technicianId?: string }): Promise<Job[]>;
  getJob(tenantId: string, jobId: string): Promise<Job | null>;
  createJob(tenantId: string, input: CreateJobInput, actorId: string): Promise<Job>;
  updateJobStatus(tenantId: string, jobId: string, status: JobStatus, actorId: string): Promise<Job>;
  assignTechnician(tenantId: string, jobId: string, technicianId: string, actorId: string): Promise<Job>;
}
