export const publicRoutes = [
  { path: '/', label: 'Home', tenantBranded: true },
  { path: '/login', label: 'Sign In', tenantBranded: false },
  { path: '/register', label: 'Register', tenantBranded: false },
  { path: '/start-free', label: 'Start Free Trial', tenantBranded: false },
  { path: '/verify-email', label: 'Verify Email', tenantBranded: false },
  { path: '/p', label: 'Storefront', tenantBranded: true }
] as const;
