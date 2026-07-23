import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aardvark-enterprises.net'),
  title: { default: 'ServicePro | Field service, under control', template: '%s | ServicePro' },
  description: 'Plan work, dispatch teams, protect assets, and keep customers informed from one operations platform.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
