import { buildBillyRuntimeSystemPrompt } from "@shared/billy/runtime";

import { getPersonaBySlug, getPersonaForRoom, type Persona } from "@/data/personas";

const ROOM_PERSONA_CACHE_KEY = "gv-room-persona-cache-v1";

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ROOM_PERSONA_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>): void {
  try {
    localStorage.setItem(ROOM_PERSONA_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage failures in private mode or locked-down contexts.
  }
}

export function getPersonaPrompt(slug: string, roomContext: string): string {
  const persona = getPersonaBySlug(slug) ?? getPersonaForRoom(roomContext);
  return buildBillyRuntimeSystemPrompt(persona.slug, roomContext);
}

export function setRoomPersona(roomBinding: string, slug: string): void {
  const cache = loadCache();
  cache[roomBinding] = slug;
  saveCache(cache);
}

export function getRoomPersona(roomBinding: string): Persona {
  const cache = loadCache();
  const slug = cache[roomBinding];

  if (slug) {
    const persona = getPersonaBySlug(slug);
    if (persona) {
      return persona;
    }
  }

  return getPersonaForRoom(roomBinding);
}

export function getRoomPersonaSlug(roomBinding: string): string {
  return getRoomPersona(roomBinding).slug;
}
