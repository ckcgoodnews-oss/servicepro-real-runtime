export type PublicShellProps = {
  brandName: string;
  primaryColor: string;
  children: unknown;
};

export function PublicShell(props: PublicShellProps) {
  return {
    component: 'PublicShell',
    brandName: props.brandName,
    primaryColor: props.primaryColor,
    children: props.children
  };
}
