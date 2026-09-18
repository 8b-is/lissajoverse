# PLAN.md — lissajoverse: the brainstorm, the review, the walls

> It lives in the same wavelength it creates: the line which mates —
> 8b-is · 2026-09-18

This file is the wiring of the operator's stream-ask into a build. Every
fragment in the ask maps to a decision below, and every wall is recorded
instead of hidden.

## the ask, mapped

| the fragment | the shape it became |
|---|---|
| "fix" oscilloscope.vaked.dev | the OSC-9000 chassis is rebuilt in place, same DNA (mic/output/sine/saw/noise, phosphor decay, trigger, REC), with the surfaces on top |
| lissajous++ | the LISSAJOUS mode grew from one curve to a seeded weave: fx:fy ratio selector (1:1, 2:3, 3:4, 5:8, 8:13), 1..7 traces, phase drift |
| Nate's papers + all wikipedia crawl-scrape OSS + robots.txt respect | the vault/diatribe shelf is the graph's core; `tools/wikicrawl.py` is the robots-respecting OSS crawl rig (article-HTML channel only, polite UA, deterministic); robots is honoured even when it starves us (below) |
| all graph of lissajous + universe = observable | UNIVERSE mode: the atlas as a graph — vault, fleet, logic, cosmos rings on a seeded starfield, edges as lissajous chords, UltraGraph-parity centrality readouts |
| NOT-NAND haha | NAND mode: the same graph re-woven by the ternary NOT-NAND grammar (`lv.nand`, `lv.nandPattern`); everything is NAND, the graph is its truth table |
| we plants are happy plants: Time (remix) + The Known Universe video | VIDEO mode + the fixed overlay: the AMNH Known Universe film × Zimmer's Time (We Plants Are Happy Plants remix), youtube-nocookie embed, scope keeps weaving behind it |
| START MAPPING — AMNH hayden planetarium ALL DATA | the atlas carries the Hayden Planetarium + Digital Universe Atlas + Uniview (SCISS) as first-class cosmos nodes, linked, credited as the sibling instrument; the full atlas can be streamed in later |
| wire in brainstorm + e2e review THEN integration | this PLAN.md is the brainstorm; the corridor is `./e2e.sh` (py_compile, seeds schema, atlas schema, `node selftest.mjs`, robots present); the review pass is the eng-code-review two-axis run recorded in docs/REVIEW.md |
| create the new 8b-is viz software, uniview vibes, reuse from 8b-is-engine | the repo IS the new software: `lissajoverse` (the rename of the working title "crossmap" with 8b-is + peterlodri vibes); the pure core mirrors 8b-is-engine's UltraGraph (Freeman degree, closeness) and the ternary lane |

## the architecture

- `index.html` — one file, no deps, two script blocks: `#lv-core` (pure
  engine: rng, lissajous, NAND grammar, centralities, atlas builder, seeded
  starfield; exposed for the selftest) and the instrument (scope + modes +
  video + REC→HF)
- `data/seeds.json` — the static seeds: the diatribe shelf, the vault, the
  fleet, logic + cosmos, Kuznets, leekHotline
- `data/atlas.jsonl` — the committed atlas the site loads (crawl output or
  static-only, honestly labelled)
- `tools/wikicrawl.py` — the robots-respecting crawl rig
- `_worker.js` — Cloudflare: /api/upload → HF dataset (env-guarded), ASSETS
  otherwise
- `selftest.mjs` + `e2e.sh` — the corridor
- README, robots.txt, llms.txt, LICENSE — the shelf documents

## the e2e review note

Fixed point: the operator's ask (this file). Axis 1 (standards): the repo
follows the OSC-9000 conventions it inherits, the pure core is comment-free
of DOM, the corridor pins behavior. Axis 2 (spec): every fragment of the ask
above has a mode or a file; nothing in the build lacks an ask. The review
run lives in docs/REVIEW.md.

## the walls, recorded honestly

1. **the wiki crawl is starved by this network**: the REST links API 404s
   for this client and sits under `/api/`, which the `*` robots entry does
   not allow anyway; article HTML delivery on this machine returns a shell
   with a handful of links, not the article body. The rig is robots-correct
   and deterministic; on a network that serves bodies it will enrich. The
   committed atlas is static-seeds-plus, and the harness says so.
2. **the REC → HF upload needs a server-side secret**: `HF_TOKEN` unset →
   503 with an honest message; frames stay client-side and retry. Nothing
   leaves the origin until the operator sets the secret.
3. **the domain**: oscilloscope.vaked.dev is the target; deploy needs the
   Cloudflare account whose Pages project owns it (wrangler auth + project
   name). Until then the repo is the source of truth and the instruction
   is one command.
4. **AMNH all-data**: the full Digital Universe Atlas cannot ride in a
   static page; the film, the links, and the seeded starfield carry the
   mapping, and the crawl can grow the neighbourhood over time.

## doctrine

theory → code → test → doc → shelf. readability is freedom: the mechanism
is the page, the tests are the witnesses, the corridor is the ledger.
Winter is coming; the queue is the harvest.