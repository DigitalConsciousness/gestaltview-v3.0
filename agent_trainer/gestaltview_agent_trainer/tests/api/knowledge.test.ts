import { describe, expect, it } from "vitest";
import { buildKnowledgeInsert } from "../../api/knowledge";

describe("knowledge helpers", () => {
  it("maps camelCase input to persistence shape", () => {
    const insert = buildKnowledgeInsert({
      userId: "user-1",
      namespace: "knowledge",
      title: "Source",
      content: "Fragment content",
      sourceUri: "https://example.com",
      sourceType: "url",
      chunkIndex: 2,
      metadata: {
        corpus: "knowledge"
      }
    });

    expect(insert).toMatchObject({
      user_id: "user-1",
      source_uri: "https://example.com",
      chunk_index: 2
    });
  });
});
