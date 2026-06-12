import './sentry.js';
import './style.css';

import * as Sentry from '@sentry/browser';

const FRAMEWORK = 'Vite Vanilla JS';

const DOC_LINKS = [
  {
    title: 'Webflow Cloud overview',
    description: 'What Webflow Cloud is and what you can build on it.',
    href: 'https://developers.webflow.com/webflow-cloud',
  },
  {
    title: 'Storing data',
    description: 'Add SQLite, Key Value, and Object Storage bindings.',
    href: 'https://developers.webflow.com/webflow-cloud/storing-data/overview',
  },
  {
    title: `${FRAMEWORK} on Webflow Cloud`,
    description: 'Build and deploy your first Webflow Cloud app.',
    href: 'https://developers.webflow.com/webflow-cloud/getting-started',
  },
  {
    title: 'Environments & deployments',
    description: 'Manage previews, production, and deployment history.',
    href: 'https://developers.webflow.com/webflow-cloud/environments',
  },
];

const BINDINGS = [
  {
    key: 'd1',
    name: 'D1',
    title: 'SQL database',
    description: 'Serverless SQLite at the edge. Great for user data, CMS content, app state.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/sqlite',
  },
  {
    key: 'r2',
    name: 'R2',
    title: 'Object storage',
    description: 'S3-compatible object storage with zero egress fees. Ideal for uploads and assets.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/object-storage',
  },
  {
    key: 'kv_sessions',
    name: 'KV · Sessions',
    title: 'Session store',
    description: 'Low-latency key-value store. Perfect for sessions, caches, and tokens.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/key-value-store',
  },
  {
    key: 'kv_flags',
    name: 'KV · Flags',
    title: 'Feature flags',
    description: 'KV namespace dedicated to feature flags with instant global propagation.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/key-value-store',
  },
];

function webflowLogo(size = 28) {
  const h = Math.round((size * 28) / 40);
  return `
    <svg width="${size}" height="${h}" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Webflow" role="img">
      <path d="M40 0L25.95 27.6H12.75L18.6 16.2H18.35C13.5 22.55 6.3 26.75 0 27.6V16.35C0 16.35 3.95 16.1 6.3 13.65H0V0.005H11.25V9.3L11.5 9.3L16.05 0H24.55L23.65 8.15L25.2 8.15L29.25 0H40Z" fill="url(#wf-mark)" />
      <defs>
        <linearGradient id="wf-mark" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop stop-color="#4353FF" />
          <stop offset="1" stop-color="#146EF5" />
        </linearGradient>
      </defs>
    </svg>`;
}

function docCard({ title, description, href }) {
  return `
    <a class="wf-card" href="${href}" target="_blank" rel="noreferrer">
      <div class="wf-card-body">
        <h3 class="wf-card-title">${title}</h3>
        <p class="wf-card-desc">${description}</p>
      </div>
      <span class="wf-card-arrow" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </a>`;
}

function bindingCard(b, svc, status) {
  const dotStatusAttr = status === 'loading' ? '' : `data-status="${status}"`;
  const latency = svc ? `${svc.latency}ms` : status === 'loading' ? '…' : '—';
  const title = svc?.error ?? status;
  return `
    <div class="wf-binding" data-status="${status}">
      <div class="wf-binding-head">
        <span class="wf-binding-name">${b.name}</span>
        <span class="wf-dot" ${dotStatusAttr} title="${title}"></span>
      </div>
      <h3 class="wf-binding-title">${b.title}</h3>
      <p class="wf-binding-desc">${b.description}</p>
      <div class="wf-binding-meta">
        <span>${latency}</span>
        <a href="${b.docs}" target="_blank" rel="noreferrer">Docs ↗</a>
      </div>
    </div>`;
}

const PING_INTERVAL_MS = 30_000;

/** UI state for the Sentry demo block (re-read on every render). */
const sentryState = { pingCount: 0, lastPing: 'waiting…' };

/**
 * "Sentry demo" block, rendered after the bindings-status section.
 * Calls /api/sentry-ping on load and every 30s. Each round trip produces:
 *  - a server-side Sentry log (emitted inside the worker route), and
 *  - a browser-side Sentry log (emitted in sentryPing below).
 * The buttons trigger a client / server error to verify error capture.
 */
function sentrySection() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return `
      <section aria-label="Sentry status" style="margin-top: 32px">
        <p class="wf-subtitle">
          Sentry is not configured — set <code>VITE_SENTRY_DSN</code> (browser)
          and <code>SENTRY_DSN</code> (worker) in your environment variables to enable it.
        </p>
      </section>`;
  }
  return `
    <section aria-label="Sentry status" style="margin-top: 32px">
      <p class="wf-subtitle">
        Sentry demo · pings <code>/api/sentry-ping</code> every ${PING_INTERVAL_MS / 1000}s ·
        pings sent: <span id="sentry-ping-count">${sentryState.pingCount}</span> ·
        last: <span id="sentry-ping-last">${sentryState.lastPing}</span>
      </p>
      <div class="wf-cta" style="margin-top: 12px">
        <button id="sentry-client-error" class="wf-btn wf-btn-ghost" type="button">
          Trigger client error
        </button>
        <button id="sentry-server-error" class="wf-btn wf-btn-ghost" type="button">
          Trigger server error
        </button>
      </div>
    </section>`;
}

/** Re-attached on every render (innerHTML wipes listeners). */
function attachSentryListeners() {
  document.getElementById('sentry-client-error')?.addEventListener('click', () => {
    throw new Error('sentry-ping: intentional test error (browser)');
  });
  document.getElementById('sentry-server-error')?.addEventListener('click', () => {
    void fetch(buildAppUrl('api/sentry-ping?error=1'));
  });
}

function updateSentryUi() {
  const count = document.getElementById('sentry-ping-count');
  const last = document.getElementById('sentry-ping-last');
  if (count) count.textContent = String(sentryState.pingCount);
  if (last) last.textContent = sentryState.lastPing;
}

async function sentryPing() {
  const startedAt = Date.now();
  try {
    const res = await fetch(buildAppUrl('api/sentry-ping'));
    const body = await res.json();

    Sentry.logger.info('client: sentry-ping completed', {
      status: res.status,
      durationMs: Date.now() - startedAt,
      serverTime: body.requestedAt ?? 'unknown',
    });

    sentryState.pingCount += 1;
    sentryState.lastPing = new Date().toLocaleTimeString();
  } catch (e) {
    Sentry.logger.error('client: sentry-ping failed', {
      durationMs: Date.now() - startedAt,
      message: e instanceof Error ? e.message : String(e),
    });
    sentryState.lastPing = 'failed — see console / Sentry';
  }
  updateSentryUi();
}

function render({ data, error } = {}) {
  const app = document.getElementById('app');
  app.className = 'wf-page';

  const bindingsSubtitle = error
    ? `Unreachable · ${error}`
    : data
    ? `Last checked ${new Date(data.timestamp).toLocaleTimeString()}`
    : 'Checking…';

  const bindingsHtml = BINDINGS.map((b) => {
    const svc = data?.services?.[b.key];
    const status = error ? 'error' : !svc ? 'loading' : svc.status;
    return bindingCard(b, svc, status);
  }).join('');

  app.innerHTML = `
    <div class="wf-glow" aria-hidden></div>

    <header class="wf-header">
      <div class="wf-brand">
        ${webflowLogo()}
        <span class="wf-brand-text">Webflow Cloud</span>
      </div>
      <nav class="wf-nav">
        <a href="https://developers.webflow.com/webflow-cloud" target="_blank" rel="noreferrer">Docs</a>
        <a href="https://github.com/Webflow-Examples" target="_blank" rel="noreferrer" class="wf-nav-ghost">GitHub</a>
      </nav>
    </header>

    <main class="wf-main">
      <section class="wf-hero">
        <p class="wf-eyebrow">Hello, world · ${FRAMEWORK} · with bindings</p>
        <h1 class="wf-title">
          Your <span class="wf-gradient">${FRAMEWORK}</span> app
          <br />is live with Cloudflare bindings.
        </h1>
        <p class="wf-subtitle">
          D1, R2, and KV are wired in. Deploy with <code>wrangler.json</code> and Webflow Cloud provisions them automatically.
        </p>
        <div class="wf-cta">
          <a class="wf-btn wf-btn-primary" href="https://developers.webflow.com/webflow-cloud/storing-data/overview" target="_blank" rel="noreferrer">
            Read the bindings guide
          </a>
          <a class="wf-btn wf-btn-ghost" href="https://github.com/Webflow-Examples/hello-world-js-app-bindings" target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </div>
      </section>

      <div class="wf-section-title">
        <h2>Cloudflare bindings</h2>
        <p>${bindingsSubtitle}</p>
      </div>
      <div class="wf-bindings">${bindingsHtml}</div>

      ${sentrySection()}

      <section class="wf-cards" aria-label="Documentation" style="margin-top: 32px">
        ${DOC_LINKS.map(docCard).join('')}
      </section>
    </main>

    <footer class="wf-footer">
      <span>
        Built with ${FRAMEWORK} · Deployed on
        <a href="https://webflow.com/cloud" target="_blank" rel="noreferrer">Webflow Cloud</a>
      </span>
    </footer>
  `;

  attachSentryListeners();
}

/**
 * Join the app's base mount path with an API path, normalizing slashes
 * regardless of whether `BASE_URL` is "", "/", "/mount", or "/mount/".
 * Returns "/<mount>/<path>" or "/<path>" when no mount is configured.
 *
 * `import.meta.env.BASE_URL` is populated by Vite from the `base` config
 * (wired to COSMIC_MOUNT_PATH at build time). Its trailing-slash behavior
 * is not guaranteed across versions / config inputs, so we normalize
 * defensively here.
 */
function buildAppUrl(path) {
  const base = (import.meta.env.BASE_URL ?? '').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}

render();

(async () => {
  try {
    const res = await fetch(buildAppUrl('api/binding-status'), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    render({ data: await res.json() });
  } catch (e) {
    render({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
})();

if (import.meta.env.VITE_SENTRY_DSN) {
  void sentryPing();
  setInterval(() => void sentryPing(), PING_INTERVAL_MS);
}
