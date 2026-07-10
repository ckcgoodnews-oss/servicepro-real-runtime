export type NavigationItem = {
  label: string;
  href: string;
  permission?: string;
  children?: NavigationItem[];
};

export function filterNavigationByPermissions(items: NavigationItem[], permissions: string[]): NavigationItem[] {
  return items
    .filter(item => !item.permission || permissions.includes(item.permission))
    .map(item => ({
      ...item,
      children: item.children ? filterNavigationByPermissions(item.children, permissions) : undefined
    }));
}
