# lissajoverse

> The observable universe as a lissajous graph. A retro oscilloscope reborn
> with the constellation's surfaces on top: the vault's papers, the wiki
> crawl, a NOT-NAND grammar, and The Known Universe riding the scope.
> scatter-city, the second face of the observable, wired over every surface.
> Show me the mechanism.

Live at [oscilloscope.vaked.dev](https://oscilloscope.vaked.dev/) · source
under 8b-is · renames the working title "crossmap" into the constellation
(the crossed maps the lissajous weaves).

## the modes

- **Mic / Output / Sine / Saw / Noise** — the faithful OSC-9000 scope, kept
- **Lissajous** — ratio selector (1:1 · 2:3 · 3:4 · 5:8 · 8:13), 1..7 woven
  traces, seeded phase drift
- **Universe** — the atlas as a graph: vault · fleet · logic · cosmos rings
  on a seeded starfield, edges as lissajous chords, UltraGraph-parity
  centrality readouts (Freeman degree + closeness, mirroring 8b-is-engine's
  world-core)
- **NAND** — the same graph re-woven by the ternary NOT-NAND grammar;
  everything is NAND, the graph is its truth table
- **Known Universe** — The AMNH film × Zimmer's Time (We Plants Are Happy
  Plants remix), the scope keeps weaving behind it

## the data

- the atlas core: the diatribe shelf (Nate/Flyxion's eleven essays),
  readability-is-freedom, the POP protocol, the fleet, the logic seeds
  (lissajous, NAND, Boolean, ternary), the cosmos seeds (Hayden
  Planetarium, Digital Universe Atlas, Uniview/SCISS as the sibling
  instrument, Simon Kuznets), leekHotline
- `tools/wikicrawl.py` — the robots.txt-respecting wikipedia crawl rig:
  polite UA, robots checked per request, article-HTML channel only
  (the REST links endpoint is not `*`-allowed), deterministic, resumable
- `data/atlas.jsonl` — the committed atlas the page fetches

## the corridor

```bash
./e2e.sh                 # py_compile · seeds schema · atlas schema · selftest · robots
node selftest.mjs        # the pure engine, vm-pinned (no browser needed)
python3 tools/wikicrawl.py --hops 2 --per-page 6 --max-nodes 140
```

Every mechanism is a line in the page or a test in the corridor; the walls
are in PLAN.md, not hidden.

## deploy

```bash
wrangler pages deploy .   # sets _worker.js + assets; secrets: HF_TOKEN, HF_REPO
wrangler pages secret put HF_TOKEN --project-name lissajoverse
wrangler pages project create lissajoverse --project-name lissajoverse
```

The custom domain oscilloscope.vaked.dev then points at the project. REC →
HF stays dark (503, honest) until HF_TOKEN exists server-side.

## credits

AMNH Hayden Planetarium (the Digital Universe Atlas lineage) · Uniview by
SCISS (the sibling instrument) · The Known Universe (Visions of the Cosmos,
Rubin Museum exhibit) · Nate (the diatribe shelf) · Wikipedia, crawled with
robots.txt respect · the constellation, whose doctrine this page is.

SPDX-License-Identifier: AGPL-3.0-only