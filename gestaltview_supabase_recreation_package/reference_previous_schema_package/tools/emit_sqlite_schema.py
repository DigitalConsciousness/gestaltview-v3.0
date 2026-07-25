#!/usr/bin/env python3
from __future__ import annotations
import json, sys
from pathlib import Path

def q(s: str) -> str:
    return '"' + s.replace('"','""') + '"'

def typ(t: str) -> str:
    if t in {'uuid','text','timestamptz','date'} or t.startswith('_') or t not in {'int4','int2','int8','float4','float8','numeric','bool','jsonb','vector'}:
        return 'TEXT'
    if t in {'int4','int2','int8'}:
        return 'INTEGER'
    if t in {'float4','float8','numeric'}:
        return 'REAL'
    if t == 'bool':
        return 'INTEGER'
    if t in {'jsonb','vector'}:
        return 'TEXT'
    return 'TEXT'

manifest = json.loads(Path(sys.argv[1]).read_text()) if len(sys.argv) > 1 else json.loads(Path('schema/gestaltview_schema_manifest.json').read_text())
print('-- SQLite/Turso first-pass schema. Review before use.\n')
for table in manifest['tables']:
    cols=[]
    pks=[]
    for c in table['columns']:
        line=f"  {q(c['name'])} {typ(c['type'])}"
        if 'Primary' in c['constraints']:
            pks.append(c['name'])
        cols.append(line)
    if pks:
        cols.append('  PRIMARY KEY ('+', '.join(q(x) for x in pks)+')')
    print(f"CREATE TABLE IF NOT EXISTS {q(table['name'])} (\n"+',\n'.join(cols)+'\n);\n')
