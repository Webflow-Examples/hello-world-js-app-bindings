import * as Sentry from '@sentry/cloudflare'

/**
 * Demo endpoint: emits a server-side Sentry structured log on every request.
 * The frontend calls it on an interval, so a deployed app produces a steady
 * stream of server logs you can watch in Sentry's Logs view.
 *
 * Pass `?error=1` to throw — verifies server-side error capture end to end
 * (the error is reported by the `withSentry` wrapper in worker/index.js).
 */
export async function handleSentryPing(request) {
  const url = new URL(request.url)
  const requestedAt = new Date().toISOString()

  Sentry.logger.info('server: sentry-ping received', {
    path: url.pathname,
    requestedAt,
    userAgent: request.headers.get('user-agent') ?? 'unknown',
  })

  if (url.searchParams.get('error') === '1') {
    throw new Error('sentry-ping: intentional test error (server)')
  }

  return new Response(JSON.stringify({ ok: true, source: 'server', requestedAt }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
