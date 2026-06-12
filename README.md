# hello-world-js-app-bindings

A **Vite + Vanilla JavaScript** starter for [**Webflow Cloud**](https://webflow.com/cloud) with Cloudflare bindings (D1, R2, KV) wired in.

At deploy time, Webflow Cloud provisions the configured services and injects them into your app as typed bindings — no API keys, no connection strings.

> Looking for the plain vanilla variant (no bindings)?
> See [`hello-world-js-app`](https://github.com/Webflow-Examples/hello-world-js-app).

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-js-app-bindings)

## Requirements

- Node **20+**

## What's included

- Vite 6
- Tailwind CSS v3
- `worker/index.js` — Cloudflare Worker serving the SPA and a `/api/binding-status` endpoint
- `wrangler.json` with **D1**, **R2**, **KV · Sessions**, **KV · Flags**
- Branded landing page that renders real-time binding status

## Quickstart

```bash
npm install

# Run locally (Vite only, no bindings)
npm run dev

# Build + preview against real bindings (wrangler)
npm run preview
```

## Deploy to Webflow Cloud

1. Fork this repo.
2. In your Webflow site, open **Apps → Webflow Cloud → Create new app** and select this repo.
3. Webflow Cloud reads `wrangler.json` and provisions D1, R2, and KV automatically.

## Bindings map

| Binding    | Type | Declared in     |
| ---------- | ---- | --------------- |
| `DB`       | D1   | `wrangler.json` |
| `MEDIA`    | R2   | `wrangler.json` |
| `SESSIONS` | KV   | `wrangler.json` |
| `FLAGS`    | KV   | `wrangler.json` |

## Sentry integration (this branch)

This branch adds a working [Sentry](https://docs.sentry.io/platforms/javascript/guides/cloudflare/) setup for Webflow Cloud:

| File                           | Purpose                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| `worker/index.js`              | Worker wrapped with `Sentry.withSentry` (`@sentry/cloudflare`) — traces + error capture on every request |
| `worker/routes/sentry-ping.js` | Emits a server-side Sentry log on every request               |
| `src/sentry.js`                | Browser init (`@sentry/browser`, logs + traces)               |
| `src/main.js`                  | "Sentry demo" block: pings the API every 30s; emits a browser-side log per round trip; buttons to trigger test errors |

### Setup

1. Create a Sentry project and copy its DSN.
2. Set **two** environment variables in your Webflow Cloud app:
   - `VITE_SENTRY_DSN` — inlined into the browser bundle at build time.
   - `SENTRY_DSN` — read by the worker at runtime.
3. Deploy. Watch your Sentry project's **Logs** view: each 30s ping produces one `server:` and one `client:` log entry. Use the buttons to trigger test errors.

> `@sentry/cloudflare` sends events with `fetch`, so it works on any worker
> `compatibility_date` — no extra transport configuration needed (unlike
> Node-transport SDKs such as `@sentry/nextjs`, which require
> `compatibility_date >= 2025-08-16` on workerd).

For local testing: `echo "SENTRY_DSN=<dsn>" > .dev.vars` then `VITE_SENTRY_DSN=<dsn> npm run preview`.

## Learn more

- [Webflow Cloud docs](https://developers.webflow.com/webflow-cloud)
- [Bindings guide](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [Vite on Webflow Cloud](https://developers.webflow.com/webflow-cloud/frameworks/vite)

---

Built with Vite + Vanilla JS · Deployed on Webflow Cloud.
