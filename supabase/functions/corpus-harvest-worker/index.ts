// supabase/functions/corpus-harvest-worker/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { requireSharedSecret } from "../_shared/auth.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const EMBED_MODEL = "text-embedding-3-small";
const CORPUS_TENANT_ID = Deno.env.get("CORPUS_TENANT_ID")!;
const CORPUS_RUN_ID = Deno.env.get("CORPUS_HARVEST_RUN_ID")!;

Deno.serve(async (req) => {
  try {
    requireSharedSecret(req, "x-gsvw-operator-secret");

    // 1. Claim pending harvest events (batch of 10)
    const { data: events, error } = await supabase
      .from("corpus_harvest_events")
      .select("*")
      .eq("harvest_status", "pending")
      .limit(10);

    if (error || !events?.length) {
      return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
    }

    let processed = 0;

    for (const event of events) {
      try {
        const payload = event.anonymized_payload;

        // 2. Compose corpus document text from anonymized profile fields
        const docContent = [
          payload.core_narrative ?? "",
          (payload.key_themes ?? []).join("\n"),
          (payload.unresolved_tensions ?? []).join("\n"),
          payload.run_kind
            ? `[sector: ${payload.sector_adaptation ?? "general"}]`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        // 3. Insert into documents
        const { data: doc, error: docErr } = await supabase
          .from("documents")
          .insert({
            run_id: CORPUS_RUN_ID,
            tenant_id: CORPUS_TENANT_ID,
            path: `corpus/harvest/${event.id}`,
            filename: `harvest_${event.id}.md`,
            hash: await sha256(docContent),
            chunk_index: 0,
            total_chunks: 1,
            content: docContent,
            mime_type: "text/markdown",
            extracted_metadata: payload,
            provenance: {
              source: "corpus_harvest",
              harvest_event_id: event.id,
            },
          })
          .select("document_id")
          .single();

        if (docErr) throw docErr;

        // 4. Generate embedding via OpenAI
        const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: EMBED_MODEL,
            input: docContent,
            dimensions: 768,
          }),
        });
        if (!embedRes.ok) {
          throw new Error(
            `Embedding request failed with HTTP ${embedRes.status}`,
          );
        }
        const embedJson = await embedRes.json();
        const vector = embedJson.data[0].embedding;

        // 5. Insert embedding
        await supabase.from("embeddings").insert({
          document_id: doc.document_id,
          model: EMBED_MODEL,
          embedding: vector,
          run_id: CORPUS_RUN_ID,
        });

        // 6. Update corpus_harvest_events → indexed + document_id FK
        await supabase
          .from("corpus_harvest_events")
          .update({ harvest_status: "indexed", document_id: doc.document_id })
          .eq("id", event.id);

        processed++;
      } catch (err) {
        // Mark failed so it doesn't block the queue
        await supabase
          .from("corpus_harvest_events")
          .update({ harvest_status: "failed" })
          .eq("id", event.id);
        console.error("Harvest failed for event", event.id, err);
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("Unauthorized") ? 401 : 500;
    return new Response(JSON.stringify({ processed: 0, error: message }), {
      headers: { "Content-Type": "application/json" },
      status,
    });
  }
});

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
