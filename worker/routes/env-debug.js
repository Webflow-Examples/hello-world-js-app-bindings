/**
 * GET /api/env-debug
 *
 * Reports the env vars + secrets visible to this app at runtime. Returns
 * ONLY names + heuristic classifications — values are never returned.
 *
 * Use this endpoint to verify, after deploying via Webflow Cloud, that
 * the env vars / secrets you configured in the dashboard are actually
 * landing in the deployed worker.
 *
 * Classifications:
 * - `likelySecret`   — name matches a known sensitive keyword (SECRET,
 *                      KEY, TOKEN, …). At runtime there is no first-class
 *                      way to distinguish a Cloudflare secret from a plain
 *                      `[vars]` entry — both arrive as strings in env —
 *                      so this is a best-effort name heuristic.
 * - `frontendPrefix` — name uses a Vite frontend prefix (`VITE_*` or
 *                      `PUBLIC_*`), meaning it would be inlined into the
 *                      client bundle at build time IF declared in the
 *                      Vite build env. Anything else is backend-only.
 *                      Note: the worker's runtime env is separate from
 *                      the frontend bundle's build-time env; this flag
 *                      reflects naming convention, not actual frontend
 *                      availability.
 */

const SENSITIVE_KEYWORDS = [
  'SECRET',
  'KEY',
  'TOKEN',
  'PASSWORD',
  'CREDENTIAL',
  'PRIVATE',
  'AUTH',
  'API_KEY',
  'APIKEY',
  'ACCESS',
  'BEARER',
  'JWT',
  'CERT',
  'PEM',
  'RSA',
]

const FRONTEND_PREFIXES = ['VITE_', 'PUBLIC_']

function isLikelySecret(name) {
  const upper = name.toUpperCase()
  return SENSITIVE_KEYWORDS.some((k) => upper.includes(k))
}

function isFrontendExposed(name) {
  return FRONTEND_PREFIXES.some((p) => name.startsWith(p))
}

export async function handleEnvDebug(_request, env) {
  // Bindings (D1/KV/R2/Fetcher) also arrive on `env` as object instances;
  // filter to string values to keep this endpoint focused on env vars /
  // secrets.
  const envVars = Object.entries(env)
    .filter(([, value]) => typeof value === 'string')
    .map(([name]) => ({
      name,
      likelySecret: isLikelySecret(name),
      frontendPrefix: isFrontendExposed(name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const body = {
    framework: 'vite',
    frontendPrefixes: FRONTEND_PREFIXES,
    totalCount: envVars.length,
    envVars,
    timestamp: new Date().toISOString(),
    note: 'Names only — values are never returned. `likelySecret` is a name heuristic; at runtime Cloudflare secrets and [vars] entries are indistinguishable. `frontendPrefix` reflects naming convention only — the worker\'s runtime env is separate from the frontend bundle\'s build-time env.',
  }

  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  })
}
