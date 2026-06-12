/// <reference types="@cloudflare/workers-types" />

import * as Sentry from '@sentry/cloudflare'

import { handleBindingStatus } from './routes/binding-status.js'
import { handleSentryPing } from './routes/sentry-ping.js'

const handler = {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url)
    // Webflow Cloud mounts the app at a path prefix (e.g. /my-app),
    // so match from /api/ onward so routing works regardless of mount.
    const apiIndex = url.pathname.indexOf('/api/')
    const path = apiIndex !== -1 ? url.pathname.slice(apiIndex) : url.pathname

    if (path === '/api/binding-status') return handleBindingStatus(request, env)

    if (path === '/api/sentry-ping') return handleSentryPing(request)

    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return env.ASSETS.fetch(request)
  },
}

/**
 * Wrap the worker with Sentry. `withSentry` instruments every request
 * (traces + error capture) and flushes events via ctx.waitUntil.
 *
 * @sentry/cloudflare sends events with `fetch`, so it works on any worker
 * compatibility_date — unlike Node-transport SDKs, which require
 * compatibility_date >= 2025-08-16 on workerd.
 *
 * Set SENTRY_DSN in your Webflow Cloud environment variables (runtime).
 */
export default Sentry.withSentry(
  (env) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    // Send Sentry structured logs (Sentry.logger.*) from the worker.
    enableLogs: true,
  }),
  handler
)
