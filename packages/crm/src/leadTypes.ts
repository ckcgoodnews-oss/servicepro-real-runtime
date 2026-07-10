export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type LeadSource = {
  id: string;
  tenantId: string;
  name: string;
  sourceType: 'website' | 'phone' | 'referral' | 'ad' | 'manual' | 'import';
  active: boolean;
};

export type Lead = {
  id: string;
  tenantId: string;
  sourceId?: string;
  status: LeadStatus;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  serviceNeeded?: string;
  problemDescription?: string;
  score: number;
  createdAt: string;
};

export type LeadScoringRule = {
  id: string;
  tenantId: string;
  name: string;
  conditionKey: string;
  conditionValue: string;
  scoreDelta: number;
  active: boolean;
};
