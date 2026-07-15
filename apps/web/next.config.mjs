import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isPagesBuild = process.env.NEXT_OUTPUT === 'export';
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isPagesBuild ? 'export' : 'standalone',
  outputFileTracingRoot: appRoot,
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: isPagesBuild,
  images: { unoptimized: isPagesBuild }
};

export default nextConfig;
