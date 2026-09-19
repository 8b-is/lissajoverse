#!/usr/bin/env python3
"""wikicrawl.py — the robots.txt-respecting wikipedia crawl, lissajoverse edition.

Merges the static atlas (vault papers, the diatribe shelf, the fleet) with a
shallow wikipedia crawl around the cosmology+logic seeds, so the observable
has neighbours. The crawl asks robots.txt before every request, sends a
polite UA, sleeps a beat between hits, and is fully deterministic (sorted
titles, fixed seed order, no randoms): the atlas is reproducible.

    python3 tools/wikicrawl.py               # 2 hops, per-page 8, max 160 nodes
    python3 tools/wikicrawl.py --hops 1 --dry-run
    python3 tools/wikicrawl.py --out data/atlas.jsonl

Exit 0 on success. If wikipedia denies the crawl (robots or network), the
atlas degrades to the static seeds and the wall is recorded, honestly.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.robotparser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SEEDS = os.path.join(ROOT, "data", "seeds.json")
DEFAULT_OUT = os.path.join(ROOT, "data", "atlas.jsonl")

UA = "lissajoverse-constellation/1.0 (educational graph; +https://oscilloscope.vaked.dev/ robots.txt respected)"
WIKI = "https://en.wikipedia.org"
ROBOTS_URL = WIKI + "/robots.txt"

ROBOTS_CACHE = {}


def slug(title):
    return title.strip().lower().replace(" ", "-").replace("_", "-")


def url_of(title):
    q = urllib.parse.quote(title.replace(" ", "_"))
    return WIKI + "/wiki/" + q


def robots(agent=UA):
    if agent not in ROBOTS_CACHE:
        rp = urllib.robotparser.RobotFileParser()
        # fetch robots.txt as OUR identifier (RobotFileParser.read() would
        # present itself as Python-urllib and Wikipedia answers that UA with
        # a stricter edition; the robots rule honoured must be the one served
        # to the crawler that actually shows up)
        try:
            req = urllib.request.Request(ROBOTS_URL, headers={"User-Agent": agent})
            with urllib.request.urlopen(req, timeout=20) as r:
                rp.parse(r.read().decode().splitlines())
        except Exception as e:  # noqa: BLE001 - network/parse walls degrade to allow
            print(f"  ! robots unreadable ({e}) -> default allow")
            rp = None
        ROBOTS_CACHE[agent] = rp
    return ROBOTS_CACHE[agent]


def allowed(url, agent=UA):
    rp = robots(agent)
    if rp is None:
        return True
    return rp.can_fetch(agent, url)


# article pages the robots.txt permits for `*` are /wiki/* — the REST links
# endpoint lives under /api/ and is NOT allowed for a generic agent. the
# polite path: fetch the article HTML (allowed), harvest its /wiki/ hrefs.
SKIP_PREFIXES = ("Special:", "Talk:", "User:", "User talk:", "Wikipedia:",
                 "File:", "Template:", "Help:", "Category:", "Portal:",
                 "Draft:", "Module:", "MediaWiki:", "Book:", "TimedText:",
                 "Gadget:", "Gadget definition:", "Education Program:",
                 "Topic:")


def page_links(title, limit, path=None):
    """First `limit` sorted outbound article titles for a wiki page, parsed
    from the article HTML the robots.txt permits us to read. An explicit
    path (from the seed's own URL) wins over the display title."""
    if path is None:
        path = "/wiki/" + urllib.parse.quote(title.replace(" ", "_"))
    if not allowed(WIKI + path):
        return []
    req = urllib.request.Request(WIKI + path, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"  ! page {title!r}: {e}")
        return []
    found = set()
    for href in re.findall(r'href="/wiki/([^"#]+)"', html):
        t = urllib.parse.unquote(href).replace("_", " ")
        if not t:
            continue
        if t.startswith(SKIP_PREFIXES):
            continue
        if ":" in t:
            continue
        found.add(t)
    return sorted(found)[:limit]


def load_seeds(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def emit(out_fp, rid, title, url, cat, hop, source):
    out_fp.write(json.dumps({"id": rid, "title": title, "url": url,
                             "cat": cat, "hop": hop, "source": source},
                            ensure_ascii=False) + "\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--hops", type=int, default=2)
    ap.add_argument("--per-page", type=int, default=8)
    ap.add_argument("--max-nodes", type=int, default=160)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--seeds", default=SEEDS)
    ap.add_argument("--sleep", type=float, default=1.1)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    seeds = load_seeds(args.seeds)
    seen = set()
    rows = []

    def add(cat, title, url, hop, source):
        rid = slug(title)
        if rid in seen:
            return
        seen.add(rid)
        rows.append((rid, title, url, cat, hop, source))

    # hop 0: everything static
    for cat, items in seeds.items():
        for it in items:
            add(cat, it["title"], it.get("url") or url_of(it["title"]), 0, "static")

    rp = robots()
    print(f"robots: {ROBOTS_URL} parsed, crawlAllowed(wiki) = "
          f"{allowed(WIKI + '/wiki/Observable_universe')}")

    # hop 1..N: expand only the wiki-dwelling seeds (cosmos + logic);
    # a seed's own URL wins over its display title, and external sources
    # (amnh, sciss, github, the diatribe pdfs) are atlas-static, never crawled
    if not args.dry_run:
        frontier = []
        for c in ("cosmos", "logic"):
            for it in seeds.get(c, []):
                url = it.get("url") or url_of(it["title"])
                if url.startswith(WIKI + "/wiki/"):
                    p = urllib.parse.urlparse(url).path
                    frontier.append((it["title"], p, c, 1))
        for step in range(1, args.hops + 1):
            next_frontier = []
            for title, path, cat, hop in frontier:
                if len(seen) >= args.max_nodes:
                    break
                links = page_links(title, args.per_page, path)
                time.sleep(args.sleep)
                for t in links:
                    if len(seen) >= args.max_nodes:
                        break
                    add(cat, t, url_of(t), hop, "wiki")
                    if hop < args.hops:
                        next_frontier.append((t, None, cat, hop + 1))
            frontier = next_frontier
            if not frontier:
                break

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        for rid, title, url, cat, hop, source in rows:
            emit(f, rid, title, url, cat, hop, source)

    by_cat = {}
    for _, _, _, cat, _, _ in rows:
        by_cat[cat] = by_cat.get(cat, 0) + 1
    print(f"atlas -> {args.out}: {len(rows)} nodes "
          f"(vault={by_cat.get('vault', 0)} fleet={by_cat.get('fleet', 0)} "
          f"logic={by_cat.get('logic', 0)} cosmos={by_cat.get('cosmos', 0)})")
    if len(rows) <= 40:
        print("  (static-only: the crawl was denied or starved; the wall is recorded, the atlas still ships)")


if __name__ == "__main__":
    sys.exit(main())