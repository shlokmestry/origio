// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

export function initClientSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Filter out noise if needed
      return event;
    },
  });
}