import Link from 'next/link';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="ServicePro home">
      <span className="brand-mark" aria-hidden="true"><span>SP</span></span>
      {!compact && <span className="brand-name">Service<span>Pro</span></span>}
    </Link>
  );
}
