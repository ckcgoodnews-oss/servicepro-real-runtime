export type AdminShellProps = {
  tenantName: string;
  userName: string;
  children: unknown;
};

export function AdminShell(props: AdminShellProps) {
  return {
    component: 'AdminShell',
    tenantName: props.tenantName,
    userName: props.userName,
    children: props.children
  };
}
