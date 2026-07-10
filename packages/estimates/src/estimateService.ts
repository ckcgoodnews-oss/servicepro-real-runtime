import { CreateEstimateInput, Estimate, EstimateStatus } from './estimateTypes';

export interface EstimateService {
  listEstimates(tenantId: string): Promise<Estimate[]>;
  getEstimate(tenantId: string, estimateId: string): Promise<Estimate | null>;
  createEstimate(tenantId: string, input: CreateEstimateInput, actorId: string): Promise<Estimate>;
  updateEstimateStatus(tenantId: string, estimateId: string, status: EstimateStatus, actorId: string): Promise<Estimate>;
}
