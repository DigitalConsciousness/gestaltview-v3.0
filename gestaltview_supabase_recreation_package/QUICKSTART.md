# Quick Start

```bash
unzip gestaltview_supabase_recreation_package.zip
cd gestaltview_supabase_recreation_package
cp .env.example .env

# Option A: Supabase CLI
supabase login
supabase link
supabase start
supabase db reset
supabase db push

# Option B: direct psql
# Fill in the live database password for the linked project if you need direct psql access.
export DATABASE_URL='postgresql://postgres.ltajayfzlaevchxngkrm:neItlgc7ZlQGc3Ag@db.ltajayfzlaevchxngkrm.supabase.co:5432/postgres'
./scripts/apply_psql.sh
./scripts/verify_psql.sh
```
