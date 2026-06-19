/**
 * POST /api/env-check
 *
 * Body: { "name": "VAR_NAME", "value": "expected-value" }
 *
 * Returns: { name, exists, matches }
 *
 * Verifies that an env var / secret was wired up with the expected value,
 * without ever returning the stored value itself. Designed for end-to-end
 * deploy testing: the test provides the value it set in the Webflow Cloud
 * dashboard, and the endpoint confirms the worker sees the same value.
 *
 * Security:
 * - The stored value is never returned.
 * - Comparison is constant-time (after a length check) to avoid timing
 *   side-channels on secret values.
 * - Only string env entries are inspected (bindings like D1/KV/R2 are
 *   skipped — they're not env vars).
 */

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleEnvCheck(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
  }

  if (typeof body.name !== 'string' || body.name.length === 0) {
    return jsonResponse({ error: '`name` must be a non-empty string' }, 400)
  }
  if (typeof body.value !== 'string') {
    return jsonResponse({ error: '`value` must be a string' }, 400)
  }

  const stored = env[body.name]
  const exists = typeof stored === 'string'
  const matches = exists && timingSafeEqual(stored, body.value)

  return jsonResponse({ name: body.name, exists, matches })
}
