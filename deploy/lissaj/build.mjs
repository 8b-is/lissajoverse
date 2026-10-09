// Regenerate worker.js from the repo's landing.html (single source of truth).
//   node deploy/lissaj/build.mjs && npx wrangler deploy -c deploy/lissaj/wrangler.toml
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "..", "landing.html"), "utf8");
const worker = `// lissaj.vaked.dev — lissajoverse landing, served by a Worker.
// GENERATED from landing.html by deploy/lissaj/build.mjs — do not edit by hand.
const HTML = ${JSON.stringify(html)};
export default {
  async fetch() {
    return new Response(HTML, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  },
};
`;
writeFileSync(join(here, "worker.js"), worker);
console.log(`worker.js regenerated (${worker.length} bytes) from landing.html`);
