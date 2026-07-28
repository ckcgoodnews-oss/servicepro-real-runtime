export const publicRoutes = [
  { path: '/', label: 'Home', tenantBranded: true },
  { path: '/login', label: 'Sign In', tenantBranded: false },
  { path: '/register', label: 'Register', tenantBranded: false },
  { path: '/p', label: 'Storefront', tenantBranded: true }
] as const;
