import originStoryMarkdown from "../../../docs/origin-story.md?raw";
import originEventsDocument from "../../../metadata/origin_events.json";

export type OriginEvent = {
  date: string;
  title: string;
  description: string;
  evidence_link?: string;
};

export type OriginEventsDocument = {
  version: number;
  events: OriginEvent[];
};

const typedOriginEvents = originEventsDocument as OriginEventsDocument;

export const ORIGIN_STORY_MARKDOWN = originStoryMarkdown;
export const ORIGIN_EVENTS_VERSION = typedOriginEvents.version;
export const ORIGIN_EVENTS = typedOriginEvents.events;

export function formatOriginEventDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
