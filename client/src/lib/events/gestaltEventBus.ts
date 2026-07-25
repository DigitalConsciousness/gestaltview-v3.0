import type { GestaltEvent, GestaltEventType } from "@shared/events/gestaltEvents";

type GestaltEventHandler = (event: GestaltEvent) => void;

export class GestaltEventBus {
  private readonly handlers = new Map<GestaltEventType | "*", Set<GestaltEventHandler>>();

  subscribe(eventType: GestaltEventType | "*", handler: GestaltEventHandler): () => void {
    const handlers = this.handlers.get(eventType) ?? new Set<GestaltEventHandler>();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  publish(event: GestaltEvent): void {
    for (const handler of this.handlers.get(event.eventType) ?? []) {
      handler(event);
    }
    for (const handler of this.handlers.get("*") ?? []) {
      handler(event);
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("gestalt:event", { detail: event }));
    }
  }
}

export const gestaltEventBus = new GestaltEventBus();
