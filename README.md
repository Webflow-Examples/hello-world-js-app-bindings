# hello-world-js-app-bindings

A **Vite + Vanilla JavaScript** starter for [**Webflow Cloud**](https://webflow.com/cloud) with Cloudflare bindings (D1, R2, KV) wired in.

At deploy time, Webflow Cloud provisions the configured services and injects them into your app as typed bindings — no API keys, no connection strings.

> Looking for the plain vanilla variant (no bindings)?
> See [`hello-world-js-app`](https://github.com/Webflow-Examples/hello-world-js-app).

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-js-app-bindings)

> **Sentry / observability example:** the
> [`feat/sentry-integration-example`](https://github.com/Webflow-Examples/hello-world-js-app-bindings/tree/feat/sentry-integration-example)
> branch adds a working Sentry setup — browser + server logs on every request,
> error capture, and a recurring ping endpoint — validated on the Cloudflare
> Workers runtime Webflow Cloud uses. See its README for setup.

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

## Learn more

- [Webflow Cloud docs](https://developers.webflow.com/webflow-cloud)
- [Bindings guide](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [Vite on Webflow Cloud](https://developers.webflow.com/webflow-cloud/frameworks/vite)

---

Built with Vite + Vanilla JS · Deployed on Webflow Cloud.
