import { createServiceRoleClient, type OperatorKitEnv } from "../api/_lib/supabaseClient";
import { loadAndValidateEnv } from "./validate-env";

async function main(): Promise<void> {
  const { env } = loadAndValidateEnv();
  const supabase = createServiceRoleClient(env as OperatorKitEnv);

  const { error: userError, data: users } = await supabase
    .from("kit_users")
    .insert({
      email: "demo@example.com",
      tier: env.KIT_TIER,
      metadata: {
        seeded: true,
        source: "seed-demo-data"
      }
    })
    .select("id")
    .limit(1);

  if (userError) {
    throw userError;
  }

  const seededUserId = users?.[0]?.id;

  if (!seededUserId) {
    throw new Error("Unable to create demo kit user.");
  }

  const { error: knowledgeError } = await supabase.from("knowledge_fragments").insert({
    user_id: seededUserId,
    namespace: "knowledge",
    title: "Welcome fragment",
    content:
      "This is a starter knowledge fragment. Replace demo content with your own curated corpus before production use.",
    metadata: {
      seeded: true,
      audience: "operator"
    }
  });

  if (knowledgeError) {
    throw knowledgeError;
  }

  const { error: skillError } = await supabase.from("skill_fragments").insert({
    user_id: seededUserId,
    name: "Operator orientation",
    description: "Basic package orientation skill for a newly configured operator.",
    domain: env.KIT_DOMAIN,
    active: true,
    metadata: {
      seeded: true
    }
  });

  if (skillError) {
    throw skillError;
  }

  console.log("Seeded demo user, knowledge fragment, and skill.");
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  console.error("Unknown demo seed failure.");
  process.exitCode = 1;
});
