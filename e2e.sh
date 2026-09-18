#!/usr/bin/env bash
# e2e.sh — the lissajoverse corridor. every green is a witnessed mechanism.
set -uo pipefail
cd "$(dirname "$0")"

echo "== corridor: lissajoverse =="
fail=0

echo "-- python: crawler compiles"
python3 -m py_compile tools/wikicrawl.py && echo "   ok py_compile" || { echo "   FAIL"; fail=1; }

echo "-- python: seeds parse"
python3 - <<'PY'
import json
s = json.load(open("data/seeds.json"))
cats = {k: len(v) for k, v in s.items()}
assert set(cats) == {"vault", "fleet", "logic", "cosmos"}, cats
print(f"   ok seeds {cats}")
PY
[ $? -eq 0 ] || { echo "   FAIL"; fail=1; }

echo "-- python: atlas schema"
python3 - <<'PY'
import json, sys
rows = []
for line in open("data/atlas.jsonl", encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    rows.append(json.loads(line))
ids = [r["id"] for r in rows]
assert len(ids) == len(set(ids)), "duplicate ids in atlas"
for r in rows:
    assert r["cat"] in ("vault", "fleet", "logic", "cosmos"), r
    assert isinstance(r["hop"], int) and r["hop"] >= 0
by = {}
for r in rows:
    by[r["cat"]] = by.get(r["cat"], 0) + 1
print(f"   ok atlas {len(rows)} nodes {by}")
PY
[ $? -eq 0 ] || { echo "   FAIL"; fail=1; }

echo "-- node: engine selftest"
node selftest.mjs || fail=1

echo "-- robot: ours honours the robots"
[ -f robots.txt ] && echo "   ok robots.txt present" || { echo "   FAIL"; fail=1; }

echo
if [ "$fail" -eq 0 ]; then
    echo "corridor: green, the mechanism is witnessed"
else
    echo "corridor: RED, a witness went missing"
fi
exit $fail