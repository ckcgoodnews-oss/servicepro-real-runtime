import type { ReactNode } from 'react';

export type PublicShellProps = {
  brandName: string;
  primaryColor: string;
  children: ReactNode;
};

export function PublicShell({ brandName, primaryColor, children }: PublicShellProps) {
  return (
    <div className="public-shell" style={{ '--brand-primary': primaryColor } as React.CSSProperties}>
      <header className="public-header">
        <span className="public-brand">{brandName}</span>
      </header>
      <main className="public-content">{children}</main>
      <footer className="public-footer">
        <small>Powered by ServicePro</small>
      </footer>
    </div>
  );
}
