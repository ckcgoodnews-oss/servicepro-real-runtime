import { Customer, CreateCustomerInput } from './customerTypes';

export interface CustomerService {
  listCustomers(tenantId: string): Promise<Customer[]>;
  getCustomer(tenantId: string, customerId: string): Promise<Customer | null>;
  createCustomer(tenantId: string, input: CreateCustomerInput, actorId: string): Promise<Customer>;
  updateCustomer(tenantId: string, customerId: string, input: Partial<CreateCustomerInput>, actorId: string): Promise<Customer>;
}
