export interface MuseumRecapSourceNote {
  title: string;
  pointer: string;
}

export interface MuseumRecapExhibit {
  title: string;
  summary: string;
  sourceNotes: MuseumRecapSourceNote[];
}

export interface MuseumRecapPromptInput {
  roomName: string;
  /**
   * Optional explicit surface label — rendered as `Surface: "<label>"` immediately
   * after the Room line. Enables the recap prompt to be surface-aware when called
   * from buildRecapPrompt() in Scaffold.tsx.
   */
  surfaceLabel?: string;
  exhibitSummaries: MuseumRecapExhibit[];
}

export function buildMuseumRecapPrompt(input: MuseumRecapPromptInput): string {
  const exhibits = input.exhibitSummaries
    .map((exhibit, index) => {
      const sourceNoteLines = exhibit.sourceNotes
        .map((item) => `- ${item.title}: ${item.pointer}`)
        .join("\n");

      return [
        `${index + 1}. ${exhibit.title}`,
        `Summary: ${exhibit.summary}`,
        sourceNoteLines ? `Source notes:\n${sourceNoteLines}` : "Source notes: none listed",
      ].join("\n");
    })
    .join("\n\n");

  const lines: string[] = [
    "You are the curator for GestaltView's Museum of You.",
    `Room: ${input.roomName}`,
  ];

  if (input.surfaceLabel) {
    lines.push(`Surface: "${input.surfaceLabel}"`);
  }

  lines.push(
    "",
    "Exhibits:",
    exhibits || "No exhibits available.",
    "",
    "Write a warm 3-5 sentence recap that stays grounded in the room's context, names the strongest patterns present, and does not invent claims. Cite the source notes when making a claim."
  );

  return lines.join("\n");
}
