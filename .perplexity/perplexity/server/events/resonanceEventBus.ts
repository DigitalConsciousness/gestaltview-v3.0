import { EventEmitter } from "node:events";

import type { GestaltEvent, GestaltEventType } from "../../shared/events/gestaltEvents.js";

type ResonanceEventHandler = (event: GestaltEvent) => void;

export class ResonanceEventBus {
  private readonly emitter = new EventEmitter();

  subscribe(eventType: GestaltEventType | "*", handler: ResonanceEventHandler): () => void {
    this.emitter.on(eventType, handler);
    return () => this.emitter.off(eventType, handler);
  }

  publish(event: GestaltEvent): void {
    this.emitter.emit(event.eventType, event);
    this.emitter.emit("*", event);
  }
}

export const resonanceEventBus = new ResonanceEventBus();
