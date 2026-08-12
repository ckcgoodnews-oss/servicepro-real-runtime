// Customer Portal API client
// Connects to /portal/* and /portal/api/* endpoints on the ServicePro API

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type ApiResponse<T = unknown> = { data: T } | { error: { code: string; message: string } };

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('portal_token');
}

function getTenantId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('portal_tenant_id') || 'tenant_demo';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-tenant-id': getTenantId(),
  };
  if (token) headers['authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok && !json.error) {
    return { error: { code: 'request_failed', message: `Request failed with status ${res.status}` } };
  }
  return json;
}

// Auth
export async function login(email: string, password: string) {
  const result = await request<{ accessToken: string; account: { id: string; tenantId: string; customerId: string; email: string } }>('POST', '/portal/login', { email, password });
  if ('data' in result && result.data.accessToken) {
    localStorage.setItem('portal_token', result.data.accessToken);
    localStorage.setItem('portal_tenant_id', result.data.account.tenantId);
    localStorage.setItem('portal_customer_id', result.data.account.customerId);
    localStorage.setItem('portal_email', result.data.account.email);
  }
  return result;
}

export function logout() {
  localStorage.removeItem('portal_token');
  localStorage.removeItem('portal_tenant_id');
  localStorage.removeItem('portal_customer_id');
  localStorage.removeItem('portal_email');
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getStoredEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('portal_email') || '';
}

// Portal API calls
export function getMe() {
  return request<{ portalAccountId: string; customerId: string; tenantId: string; email: string }>('GET', '/portal/api/me');
}

export function getBookings() {
  return request<Array<{ id: string; serviceId: string; preferredDate: string; status: string; notes: string; createdAt: string }>>('GET', '/portal/api/bookings');
}

export function createBooking(data: { serviceId?: string; preferredDate: string; notes: string }) {
  return request<{ id: string }>('POST', '/portal/api/bookings', data);
}

export function getInvoices() {
  return request<Array<{ id: string; number: string; amount: number; status: string; dueDate: string; createdAt: string }>>('GET', '/portal/api/invoices');
}

export function getInvoicePaymentInfo(id:string){return request<{invoiceId:string;balanceDue:number;currency:string;acceptedMethods:string[];partialPaymentsEnabled:boolean;stripeConnectedAccountId:string}>('GET',`/portal/api/invoices/${encodeURIComponent(id)}/payment-info`);}
export function createInvoicePayment(id:string,data:{amountCents?:number;idempotencyKey:string}){return request<{clientSecret:string;stripePaymentIntentId:string;paymentId:string}>('POST',`/portal/api/invoices/${encodeURIComponent(id)}/pay`,data);}

export function getEstimates() {
  return request<Array<{ id: string; number: string; amount: number; status: string; createdAt: string }>>('GET', '/portal/api/estimates');
}

export type ExpressServiceInfo={enabled:boolean;requireDescription:boolean;emergencyEnabled:boolean;afterHoursEnabled:boolean;eligibleServices:Array<{id:string;name:string;description:string;basePrice:number}>};
export type ExpressServiceRequest={id:string;serviceId:string;description:string;urgency:string;status:string;createdAt:string;updatedAt?:string};
export function getExpressService(){return request<ExpressServiceInfo>('GET','/portal/api/express-service');}
export function getExpressServiceRequests(){return request<ExpressServiceRequest[]>('GET','/portal/api/express-service/requests');}
export function createExpressServiceRequest(data:{serviceId:string;description:string;urgency:string}){return request<ExpressServiceRequest>('POST','/portal/api/express-service',data);}
