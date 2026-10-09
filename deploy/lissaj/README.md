# deploy/lissaj — lissaj.vaked.dev

The short domain serves the **landing page** (`landing.html`) from a Cloudflare
Worker, so the instrument stays at [oscilloscope.vaked.dev](https://oscilloscope.vaked.dev/)
and the front door gets its own name.

```
lissaj.vaked.dev  →  Worker "lissaj"  →  landing.html
```

## regenerate + deploy

`worker.js` embeds `landing.html`; it is **generated**, not hand-edited. After
any change to `landing.html`:

```bash
node deploy/lissaj/build.mjs
npx wrangler deploy -c deploy/lissaj/wrangler.toml
```

`wrangler.toml` declares the custom domain:

```toml
routes = [ { pattern = "lissaj.vaked.dev", custom_domain = true } ]
```

No DNS record to manage by hand — the Worker custom domain provisions it.
