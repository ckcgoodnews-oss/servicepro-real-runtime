import type { NextConfig } from 'next';

const config: NextConfig = {
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  trailingSlash: true,
  images: { unoptimized: true }
};

export default config;
