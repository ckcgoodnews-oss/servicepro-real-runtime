export type Customer = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export type Job = {
  id: string;
  tenantId: string;
  customerId?: string;
  title: string;
  status: string;
};
