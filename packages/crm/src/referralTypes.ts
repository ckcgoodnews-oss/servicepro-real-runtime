export type ReferralProgram = {
  id: string;
  tenantId: string;
  name: string;
  rewardType: 'credit' | 'cash' | 'discount' | 'gift';
  rewardAmount: number;
  active: boolean;
};

export type Referral = {
  id: string;
  tenantId: string;
  programId: string;
  referringCustomerId: string;
  referredLeadId?: string;
  referredCustomerId?: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'cancelled';
};
