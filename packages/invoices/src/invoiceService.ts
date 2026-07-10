import { CreateInvoiceInput, Invoice, InvoiceStatus } from './invoiceTypes';

export interface InvoiceService {
  listInvoices(tenantId: string): Promise<Invoice[]>;
  getInvoice(tenantId: string, invoiceId: string): Promise<Invoice | null>;
  createInvoice(tenantId: string, input: CreateInvoiceInput, actorId: string): Promise<Invoice>;
  updateInvoiceStatus(tenantId: string, invoiceId: string, status: InvoiceStatus, actorId: string): Promise<Invoice>;
  recordPayment(tenantId: string, invoiceId: string, amount: number, actorId: string): Promise<Invoice>;
}
