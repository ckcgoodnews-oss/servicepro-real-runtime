import { CreateDispatchAssignmentInput, DispatchAssignment, DispatchAssignmentStatus } from './dispatchTypes';

export interface DispatchService {
  listAssignments(tenantId: string, filters?: { technicianId?: string; status?: DispatchAssignmentStatus }): Promise<DispatchAssignment[]>;
  assignJob(tenantId: string, input: CreateDispatchAssignmentInput, actorId: string): Promise<DispatchAssignment>;
  updateAssignmentStatus(tenantId: string, assignmentId: string, status: DispatchAssignmentStatus, actorId: string): Promise<DispatchAssignment>;
}
