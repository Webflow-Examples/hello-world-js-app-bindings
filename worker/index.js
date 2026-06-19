/// <reference types="@cloudflare/workers-types" />

import { handleBindingStatus } from './routes/binding-status.js'
import { handleEnvDebug } from './routes/env-debug.js'

export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url)
    // Webflow Cloud mounts the app at a path prefix (e.g. /my-app),
    // so match from /api/ onward so routing works regardless of mount.
    const apiIndex = url.pathname.indexOf('/api/')
    const path = apiIndex !== -1 ? url.pathname.slice(apiIndex) : url.pathname

    if (path === '/api/env-debug') return handleEnvDebug(request, env)
    if (path === '/api/binding-status') return handleBindingStatus(request, env)

    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
