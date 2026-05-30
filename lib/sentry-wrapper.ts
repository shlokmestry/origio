// lib/sentry-wrapper.ts
import * as Sentry from "@sentry/nextjs";

export function withSentryErrorCapture<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      Sentry.captureException(error, {
        contexts: {
          api: {
            route: context || "unknown",
          },
        },
      });
      throw error;
    }
  }) as T;
}