import * as Sentry from '@sentry/browser';

/**
 * Browser-side Sentry initialization. Imported first from main.js so it
 * runs before the app renders. The DSN is inlined at build time from
 * VITE_SENTRY_DSN — set it in your Webflow Cloud environment variables.
 */
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Demo settings: capture everything. Lower these in a real app.
  tracesSampleRate: 1.0,

  // Send Sentry structured logs (Sentry.logger.*) from the browser.
  enableLogs: true,
});
