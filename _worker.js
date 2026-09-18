// lissajoverse `_worker.js` — /api/upload → HF dataset · everything else → ASSETS
// deploy: wrangler pages deploy . (Pages auto-picks _worker.js; set HF_TOKEN
// and HF_REPO secrets, and the custom domain oscilloscope.vaked.dev)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      return handleUpload(request, env);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('lissajoverse: a static host with an ASSETS binding is required', { status: 501 });
  }
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
  });
}

async function handleUpload(request, env) {
  // THE WALL, HONESTLY: recordings are captured client-side but nothing
  // leaves this origin until HF_TOKEN exists server-side. no token -> 503,
  // the page keeps the frames in memory and retries.
  const token = env.HF_TOKEN;
  if (!token) {
    return json(503, { ok: false, error: 'HF_TOKEN not configured; nothing leaves this origin' });
  }
  try {
    const body = await request.json();
    const repo = env.HF_REPO || 'PeetPedro/lissajoverse-capture';
    const path = 'sessions/' + (body.session || 'unknown') + '-' + Date.now() + '.jsonl';
    const fd = new FormData();
    fd.append('file', new File([JSON.stringify(body)], path, { type: 'application/jsonl' }));
    const res = await fetch('https://huggingface.co/api/datasets/' + repo + '/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: fd
    });
    if (!res.ok) {
      const text = await res.text().catch(function () { return ''; });
      return json(502, { ok: false, error: 'hf ' + res.status, detail: text.slice(0, 200) });
    }
    return json(200, { ok: true, path: path });
  } catch (e) {
    return json(400, { ok: false, error: String(e) });
  }
}