#!/usr/bin/env node
/*
  selftest.mjs — deterministic gate for lissajoverse
  SPDX-License-Identifier: AGPL-3.0-only

  - extracts the #lv-core pure engine block from index.html
  - evaluates it in node:vm (no browser needed)
  - asserts the engine invariants:
      * rng deterministic under a seed, different across seeds
      * liss bounded, diagonal equality at ratio 1:1 phase 0
      * NAND truth table + commutativity on the ternary lane {-1,0,+1}
      * nandPattern length, values, reproducibility
      * UltraGraph parity: degree centrality and closeness on truth graphs
      * buildAtlas dedupe + hub connectivity
      * universeLayer finite on the unit domain
      * VIDEO_URL names the Known Universe id
      * no NaN anywhere
  Usage: node selftest.mjs
  Exit 0 on pass, 1 on fail.
*/
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(HERE, 'index.html'), 'utf8');

const m = html.match(/<script id="lv-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: #lv-core block not found in index.html'); process.exit(1); }

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(m[1], sandbox, { filename: 'lv-core' });
const lv = sandbox.__lv;
if (!lv) { console.error('FAIL: __lv not exposed by lv-core'); process.exit(1); }

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}
const allFinite = (arr) => arr.every(v => Number.isFinite(v));

// 1. rng determinism
{
  const a = lv.rng(7), b = lv.rng(7), c = lv.rng(8);
  const a1 = a(), b1 = b();
  ok('rng deterministic under a seed', a1 === b1);
  ok('rng separates seeds', a1 !== c());
  ok('rng output is a probability', a1 > 0 && a1 < 1);
}

// 2. liss bounded + diagonal
{
  const pts = lv.lissPath(2, 3, 0, 2048);
  ok('lissPath length', pts.length === 2049);
  ok('liss bounded to the unit square', pts.every(p => Math.abs(p.x) <= 1 + 1e-9 && Math.abs(p.y) <= 1 + 1e-9));
  ok('lissPath no NaN', allFinite(pts.flatMap(p => [p.x, p.y])));
  const diag = lv.lissPath(1, 1, 0, 64);
  ok('ratio 1:1 phase 0 draws the diagonal', diag.every(p => Math.abs(p.x - p.y) < 1e-9));
}

// 3. NAND truth table + commutativity (ternary {-1,0,+1})
{
  ok('nand(1,1) = -1', lv.nand(1, 1) === -1);
  ok('nand(1,-1) = +1', lv.nand(1, -1) === 1);
  ok('nand(-1,1) = +1', lv.nand(-1, 1) === 1);
  ok('nand(-1,-1) = +1', lv.nand(-1, -1) === 1);
  ok('nand(1,0) = +1', lv.nand(1, 0) === 1);
  ok('nand(0,0) = +1', lv.nand(0, 0) === 1);
  const commutes = [-1, 0, 1].every(a => [-1, 0, 1].every(b => lv.nand(a, b) === lv.nand(b, a)));
  ok('nand commutes', commutes);
}

// 4. nandPattern
{
  const p = lv.nandPattern(64);
  const q = lv.nandPattern(64);
  ok('nandPattern length', p.length === 64);
  ok('nandPattern only {-1,+1}', p.every(v => v === -1 || v === 1));
  ok('nandPattern reproducible', p.every((v, i) => v === q[i]));
  ok('nandPattern no NaN', allFinite(p));
}

// 5. UltraGraph parity: degree centrality
{
  const d = lv.degreeCentrality(3, [[0, 1, 1], [1, 2, 1]]);
  ok('degree path 0-1-2 -> [1,2,1]', JSON.stringify(d) === '[1,2,1]');
  const da = lv.degreeCentrality(3, [[0, 1, 1], [1, 2, 0]]);
  ok('silent edges do not count', JSON.stringify(da) === '[1,1,0]');
}

// 6. UltraGraph parity: closeness
{
  const c = lv.closeness(3, [[0, 1, 1], [1, 2, 1]]);
  ok('closeness finite', allFinite(c));
  ok('closeness center beats leaves', c[1] > c[0] && c[1] > c[2]);
  const iz = lv.closeness(3, []);
  ok('closeness isolated graph is zero', iz.every(v => v === 0));
}

// 7. buildAtlas
{
  const rows = [
    { id: 'a', title: 'A Paper', url: 'https://ex.org/a', cat: 'vault' },
    { id: 'b', title: 'B Paper', url: 'https://ex.org/b', cat: 'vault' },
    { id: 'c', title: 'C Gate', url: 'https://ex.org/c', cat: 'logic' },
    { id: 'd', title: 'D Star', url: 'https://ex.org/d', cat: 'cosmos' }
  ];
  const g = lv.buildAtlas(rows.concat([{ id: 'a', title: 'dup', cat: 'vault' }]));
  ok('atlas dedupes ids', g.nodes.length === 4);
  ok('atlas edges exist and stay in range', g.edges.length >= 3 && g.edges.every(e => e[0] < 4 && e[1] < 4));
  ok('atlas hub connects everything', (() => {
    const adj = Array.from({ length: 4 }, () => new Set());
    for (const e of g.edges) { adj[e[0]].add(e[1]); adj[e[1]].add(e[0]); }
    return Array.from({ length: 4 }, (_, i) => i).every(i => i === 0 || adj[i].size > 0);
  })());
}

// 8. universeLayer
{
  const stars = lv.universeLayer(11, 260);
  ok('starfield count', stars.length === 260);
  ok('starfield finite on the unit sphere', stars.every(s => allFinite([s.x, s.y, s.z]) && Math.abs(s.x) <= 1 && Math.abs(s.y) <= 1 && Math.abs(s.z) <= 1));
  const again = lv.universeLayer(11, 260);
  ok('starfield reproducible', stars.every((s, i) => s.x === again[i].x && s.y === again[i].y));
}

// 9. the video
ok('VIDEO_URL names the Known Universe id', lv.VIDEO_URL.includes('DVPcDNwcgbI') && lv.VIDEO_URL.includes('youtube-nocookie.com'));

// 10. no NaN sweep
{
  let nan = 0;
  for (let s = 0; s < 50; s++) {
    const p = lv.lissPath(1 + (s % 7), 2 + (s % 5), s * 0.01, 300);
    const pat = lv.nandPattern(80);
    if (!allFinite(p.flatMap(v => [v.x, v.y]))) nan++;
    if (!allFinite(pat)) nan++;
    const g = lv.buildAtlas([{ id: 'v' + s, title: 'V' + s, cat: 'vault' }, { id: 'c' + s, title: 'C' + s, cat: 'cosmos' }]);
    if (!allFinite(lv.closeness(g.nodes.length, g.edges))) nan++;
  }
  ok('no NaN across 50 seeded sweeps', nan === 0);
}

console.log(`\nselftest: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);