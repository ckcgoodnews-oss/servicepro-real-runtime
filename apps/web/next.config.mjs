import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

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

const canUploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

export default canUploadSourceMaps
  ? withSentryConfig(nextConfig, {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      sourcemaps: { deleteSourcemapsAfterUpload: true },
      telemetry: false
    })
  : nextConfig;
