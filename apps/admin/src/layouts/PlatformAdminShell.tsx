import { platformAdminNavigation, platformDashboardRoute } from '../routes/platformAdminRoutes';
import type { PlatformNavSection } from '../routes/platformAdminRoutes';

export type PlatformAdminShellProps = {
  adminEmail: string;
  currentPath: string;
  children: unknown;
};

export type SidebarSection = {
  key: string;
  label: string;
  icon: string;
  expanded: boolean;
  items: Array<{ path: string; label: string; active: boolean }>;
};

function buildSidebar(currentPath: string): SidebarSection[] {
  return platformAdminNavigation.map((section: PlatformNavSection) => ({
    key: section.key,
    label: section.label,
    icon: section.icon,
    expanded: section.items.some(item => currentPath.startsWith(item.path)),
    items: section.items.map(item => ({
      path: item.path,
      label: item.label,
      active: currentPath === item.path
    }))
  }));
}

export function PlatformAdminShell(props: PlatformAdminShellProps) {
  const sidebar = buildSidebar(props.currentPath);
  const dashboardActive = props.currentPath === platformDashboardRoute.path;

  return {
    component: 'PlatformAdminShell',
    adminEmail: props.adminEmail,
    currentPath: props.currentPath,
    navigation: {
      dashboard: { ...platformDashboardRoute, active: dashboardActive },
      sections: sidebar
    },
    children: props.children
  };
}
