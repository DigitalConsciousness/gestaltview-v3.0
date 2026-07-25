# GestaltView Collaborator RLS Scaffold v1.0

**Status:** Draft  
**Scope:** Initial Row Level Security and access-model guidance for the collaborator system.  
**Last Updated:** 2026-04-13

---

## 1. Purpose

This document defines the first-pass access model for:

- `public.collaborators`
- `public.collaborator_roles`
- `public.collaborator_relationships`
- `public.collaborator_permissions`
- `public.collaborator_onboarding_events`
- `public.collaborator_embodiment_links`

This is a scaffold, not the final enforcement model.

---

## 2. Canonical Access Principle

The collaborator system is governance-bearing infrastructure.

That means:

- ordinary end users should not receive broad read access
- operators/admins may require broad access
- collaborators may receive scoped visibility to their own representation
- service-role operations may provision and maintain collaborator state

---

## 3. Recommended Access Classes

### Class A — service role
Full read/write for provisioning, migrations, syncing, and admin workflows.

### Class B — admin/operator
Read/write for collaborator management, onboarding review, relationship updates, and permissions governance.

### Class C — self-scoped collaborator
Read-only access to their own collaborator record and directly linked surfaces, where applicable.

### Class D — general authenticated user
No default access unless explicitly granted through future policy layers.

---

## 4. Table Guidance

### `public.collaborators`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: read own row only
- others: no access

### `public.collaborator_roles`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: read own roles only
- others: no access

### `public.collaborator_relationships`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: read rows where they are source or target
- others: no access

### `public.collaborator_permissions`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: optionally read own permissions
- others: no access

### `public.collaborator_onboarding_events`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: usually no access by default unless needed
- others: no access

### `public.collaborator_embodiment_links`
Recommended:
- service role: full access
- admins: full access
- self-scoped collaborator: read own links
- others: no access

---

## 5. Policy Shape Notes

Because `collaborators` can point to:
- `auth_user_id`
- `app_user_id`
- `agent_id`

the first practical self-scope policy should rely only on `auth.uid()` where possible.

That means:
- human collaborators linked through `auth_user_id` are the easiest to self-scope first
- agent-linked or external digital collaborators should initially remain admin/service-managed
- future agent-native policy models can expand from there

---

## 6. First-Pass SQL Skeleton

```sql
alter table public.collaborators enable row level security;
alter table public.collaborator_roles enable row level security;
alter table public.collaborator_relationships enable row level security;
alter table public.collaborator_permissions enable row level security;
alter table public.collaborator_onboarding_events enable row level security;
alter table public.collaborator_embodiment_links enable row level security;

-- Example: admins can do everything
create policy collaborators_admin_all
on public.collaborators
for all
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
);

-- Example: collaborator can read their own row when auth-linked
create policy collaborators_self_read
on public.collaborators
for select
to authenticated
using (
  auth_user_id = auth.uid()
);
