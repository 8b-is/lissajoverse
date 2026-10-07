# REVIEW.md — lissajoverse, the two-axis review

*Fixed point:* `PLAN.md` (the operator's ask, "the ask, mapped") plus the repo's
own conventions — the OSC-9000 lineage, a deterministic pure core, and the
corridor (`./e2e.sh`) as the ledger. Run as two independent passes, standards
first, so neither pollutes the other.

Commit at run: `deb5fa7`. Corridor: **green** (31 selftest assertions).

---

## Axis 1 — Standards

Convention conformance + a Fowler-smell baseline. The repo's own rules come
first: a comment-free `#lv-core` with no DOM, deterministic generation, retro
naming, and tests that pin behavior.

### Blockers
None.

### Shoulds
1. **Duplicated source of truth — the video id.** `index.html:215` (the
   `<iframe src>`) and `index.html:363` (`const VIDEO_URL`) each hard-coded
   `DVPcDNwcgbI`. The constant is asserted by the corridor
   (`selftest.mjs:131`), but the iframe was a *separate literal* — so the one
   thing the test guarded could silently drift from the thing that renders.
   *Fix (applied):* drop the literal and populate the iframe `src` from the
   core constant at startup (`index.html:426`); now the id appears once.

### Nits
1. `_worker.js:handleUpload` builds the FormData file with no content-type and
   accepts any JSON body. Fine for a personal capture lane; a `content-length`
   cap would bound abuse.
2. `index.html` is a single ~42 KB file. This is *intentional* (one file, no
   deps, per PLAN) and the `#lv-core` / instrument split keeps it honest —
   noted as accepted, not a smell to fix.

### Tests
The corridor runs `py_compile`, the seeds schema, the atlas schema, and **31**
`selftest.mjs` assertions pinning *behavior* (the NAND truth table, centrality
ordering, starfield reproducibility, no-NaN sweeps) rather than implementation.
Good. The one gap — the rendered video element was not among the witnesses —
is closed by Should 1 (the element now reads the tested constant).

---

## Axis 2 — Spec

Source of truth: `PLAN.md`, "the ask, mapped". Each fragment walked to code.

| fragment | code | verdict |
|---|---|---|
| fix `oscilloscope.vaked.dev` | OSC-9000 chassis; `index.html` modes mic/output/sine/saw/noise | met |
| lissajous++ | `lv.liss`, `lv.lissPath`, ratios 1:1…8:13, traces, phase drift | met |
| papers + wikipedia crawl + robots respect | `tools/wikicrawl.py` (robots per request, polite UA, deterministic), `data/atlas.jsonl` | met |
| graph = observable (UNIVERSE) | `lv.buildAtlas`, `lv.degreeCentrality`, `lv.closeness`, `universeLayer` | met |
| NOT-NAND | `lv.nand`, `lv.nandPattern` | met |
| video + overlay | `VIDEO_URL`, youtube-nocookie iframe | met (drift note above) |
| AMNH all-data | cosmos seeds (18), Hayden / Digital Universe Atlas / Uniview nodes | met as far as a static page can (PLAN wall 4) |
| brainstorm + e2e review → `PLAN.md` + `docs/REVIEW.md` | `PLAN.md` ✓ · `e2e.sh` ✓ · **`docs/REVIEW.md` absent** | **unmet → closed by this file** |
| new 8b-is viz, UltraGraph parity | UltraGraph mirror in the core | met |

**Edges.** PLAN says the crawl "degrades to the static seeds and records the
wall" — the committed atlas is static-seeds-plus and the harness says so
(wall 1). Nothing the spec forbade happens: no write path without `HF_TOKEN`
(wall 2), no credentials in the client.

**Divergence.** Exactly one: `PLAN.md` named `docs/REVIEW.md` and the file did
not exist. This review *is* that file; the divergence is now closed.

---

## Verdict

**approve-with-comments.** No blockers. One should (video-id duplication — now
fixed), two nits (both accepted-by-design or low-risk). The spec is faithfully
implemented; the single unmet requirement — this document — is now satisfied.

— run against `deb5fa7` · corridor green (31 passed) · 2026-10-07.
