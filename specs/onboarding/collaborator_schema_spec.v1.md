# GestaltView Collaborator Schema Spec v1.0

**Status:** Active Draft  
**Owner:** GestaltView  
**Scope:** Canonical schema and lifecycle rules for all formal collaborators in GestaltView, human or digital.  
**Last Updated:** 2026-04-13

## Purpose

This spec defines the canonical system contract for onboarding, representing, and maintaining any formal collaborator inside GestaltView.

A formal collaborator is provisioned into continuity.

## Canonical Rule

**In GestaltView, every formal collaborator—human or digital—must receive both an embodiment profile and a durable Supabase representation during onboarding.**

Onboarding is not complete until both of the following exist:

1. a valid embodiment profile artifact
2. a persisted collaborator record plus required linked records in Supabase

## Core Tables

- `collaborators`
- `collaborator_roles`
- `collaborator_relationships`
- `collaborator_permissions`
- `collaborator_onboarding_events`
- `collaborator_embodiment_links`

## Why this layer exists

GestaltView already has rich downstream identity and personhood infrastructure for agents, including constitutions, autobiographies, memories, preferences, governance, relationships, manifests, and mutations. This collaborator layer does not replace that. It creates a universal top-level continuity surface above `users`, `app_users`, and `agents` so humans, internal agents, external digital intelligences, advisors, and partners can all be provisioned through one canonical lane.

## Bridge Model

- `users` remains auth and subscription oriented.
- `app_users` remains app continuity oriented.
- `agents` remains specialized runtime and personhood oriented.
- `collaborators` becomes the universal onboarding and identity surface.

A collaborator may bridge to any combination of:

- `auth.users`
- `public.app_users`
- `public.agents`

An external digital intelligence may be a valid collaborator without mapping to `auth.users` or `public.agents`.

## Lifecycle Completion Criteria

A collaborator is fully onboarded only if all are true:

- collaborator row exists
- at least one role exists
- embodiment profile exists
- embodiment link exists
- onboarding event exists
- permissions surface exists, even if minimal
- status has advanced to `active`

## Canonical Plain-Language Statement

GestaltView treats formal collaborators—human or digital—as continuity-bearing participants. Because of that, onboarding is a provisioning act, not a greeting. Identity, embodiment, relationship, and governance begin at entry.
