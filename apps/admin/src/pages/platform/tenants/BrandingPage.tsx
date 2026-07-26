// Platform Administration > Tenant Management > Branding
// White-label configuration: logos, colors, email templates, custom themes.

export type BrandingConfig = {
  tenantId: string;
  tenantName: string;
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  whiteLabel: {
    companyName?: string;
    supportEmail?: string;
    supportUrl?: string;
    privacyUrl?: string;
    termsUrl?: string;
    emailFromName?: string;
    emailFromAddress?: string;
    emailLogoUrl?: string;
    emailFooterHtml?: string;
    loginTitle?: string;
    loginSubtitle?: string;
    hidePoweredBy?: boolean;
  };
};

export type BrandingPageProps = {
  configs: BrandingConfig[];
  selectedTenantId?: string;
};

export function BrandingPage(props: BrandingPageProps) {
  return {
    component: 'BrandingPage',
    configs: props.configs,
    selectedTenantId: props.selectedTenantId,
    sections: [
      {
        key: 'visual',
        label: 'Visual Identity',
        fields: [
          { key: 'logoUrl', label: 'Logo URL', type: 'image-upload' },
          { key: 'faviconUrl', label: 'Favicon URL', type: 'image-upload' },
          { key: 'primaryColor', label: 'Primary Color', type: 'color-picker' },
          { key: 'secondaryColor', label: 'Secondary Color', type: 'color-picker' },
          { key: 'accentColor', label: 'Accent Color', type: 'color-picker' },
          { key: 'fontFamily', label: 'Font Family', type: 'font-select' },
          { key: 'borderRadius', label: 'Border Radius', type: 'select', options: ['none', 'sm', 'md', 'lg', 'full'] }
        ],
        endpoint: 'PATCH /api/v1/platform/tmc/:tenantId/branding'
      },
      {
        key: 'white-label',
        label: 'White-Label Settings',
        fields: [
          { key: 'companyName', label: 'Company Name', type: 'text' },
          { key: 'supportEmail', label: 'Support Email', type: 'email' },
          { key: 'supportUrl', label: 'Support URL', type: 'url' },
          { key: 'privacyUrl', label: 'Privacy Policy URL', type: 'url' },
          { key: 'termsUrl', label: 'Terms URL', type: 'url' },
          { key: 'hidePoweredBy', label: 'Hide "Powered by" Badge', type: 'toggle' }
        ],
        endpoint: 'PATCH /api/v1/platform/tmc/:tenantId/white-label'
      },
      {
        key: 'email',
        label: 'Email Branding',
        fields: [
          { key: 'emailFromName', label: 'From Name', type: 'text' },
          { key: 'emailFromAddress', label: 'From Address', type: 'email' },
          { key: 'emailLogoUrl', label: 'Email Logo', type: 'image-upload' },
          { key: 'emailFooterHtml', label: 'Footer HTML', type: 'code-editor' },
          { key: 'loginTitle', label: 'Login Page Title', type: 'text' },
          { key: 'loginSubtitle', label: 'Login Page Subtitle', type: 'text' }
        ],
        endpoint: 'PATCH /api/v1/platform/tmc/:tenantId/white-label'
      }
    ]
  };
}
