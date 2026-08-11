import * as Sentry from '@sentry/nextjs';
import { sentryPrivacyOptions } from './src/lib/sentryPrivacy';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    ...sentryPrivacyOptions
  });
}
