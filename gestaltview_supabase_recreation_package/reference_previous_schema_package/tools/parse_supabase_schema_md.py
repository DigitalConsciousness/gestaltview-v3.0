#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys, hashlib
from pathlib import Path
from datetime import datetime, timezone

def parse(path: Path) -> dict:
    md = path.read_text(encoding="utf-8")
    parts = re.split(r'(?=^## Table `)', md, flags=re.M)
    tables=[]
    for part in parts:
        if not part.startswith('## Table `'):
            continue
        m=re.match(r'## Table `([^`]+)`\n', part)
        name=m.group(1)
        before, _, after=part[m.end():].partition('### Columns')
        cols=[]
        for line in after.splitlines():
            if line.startswith('| `'):
                cells=[c.strip() for c in line.strip().strip('|').split('|')]
                if len(cells)>=3:
                    cols.append({'name':cells[0].strip('`'), 'type':cells[1].strip('`'), 'constraints':cells[2].strip()})
        tables.append({'name':name, 'description':before.strip(), 'columns':cols})
    return {
        'generated_at': datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        'source': str(path),
        'source_sha256': hashlib.sha256(md.encode('utf-8')).hexdigest(),
        'table_count': len(tables),
        'column_count': sum(len(t['columns']) for t in tables),
        'tables': tables,
    }

if __name__ == '__main__':
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('supabaseSchema.md')
    print(json.dumps(parse(src), indent=2))
