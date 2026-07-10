export type FrontendRoute = {
  path: string;
  label: string;
  permission?: string;
  tenantBranded?: boolean;
};

export type Breadcrumb = {
  label: string;
  href?: string;
};

export type PageMeta = {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
};
