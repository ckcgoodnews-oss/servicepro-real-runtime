export type DispatchAssignmentStatus = 'assigned' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled';

export type DispatchAssignment = {
  id: string;
  tenantId: string;
  jobId: string;
  technicianId: string;
  status: DispatchAssignmentStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  assignedAt: string;
  assignedBy?: string;
};

export type CreateDispatchAssignmentInput = {
  jobId: string;
  technicianId: string;
  scheduledStart?: string;
  scheduledEnd?: string;
};
