export type Money = {
  amount: number;
  currency: 'USD';
};

export type ServiceAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type EntityAuditFields = {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
