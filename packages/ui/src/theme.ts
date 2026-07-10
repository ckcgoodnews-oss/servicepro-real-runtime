export type TenantTheme = {
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
};

export const defaultTenantTheme: TenantTheme = {
  brandName: 'ServicePro',
  primaryColor: '#1d72d2',
  secondaryColor: '#102a43',
  accentColor: '#22c55e',
  borderRadius: 'md'
};
