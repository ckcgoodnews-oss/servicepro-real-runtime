import Link from 'next/link';
import { BrandMark } from './BrandMark';

const links = [['Solutions', '#solutions'], ['Industries', '#industries'], ['Pricing', '#pricing'], ['Resources', '#resources']] as const;

export function PublicHeader() {
  return <header className="public-header"><div className="public-nav page-width"><BrandMark /><nav aria-label="Primary navigation">{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav><div className="header-actions"><Link className="text-link" href="/login">Sign in</Link><Link className="button button-small" href="/login">Start free</Link></div></div></header>;
}
