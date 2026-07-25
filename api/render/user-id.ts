const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class RenderUserResolutionError extends Error {
  readonly code = "RENDER_USER_ID_UNRESOLVED";
}

export async function resolveRenderUserId(authUser: {
  id: string;
  email: string;
}): Promise<string> {
  if (UUID_PATTERN.test(authUser.id)) return authUser.id;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
  const email = authUser.email.trim().toLowerCase();
  if (!supabaseUrl || !serviceKey || !email) {
    throw new RenderUserResolutionError(
      "The authenticated session does not contain a database UUID and cannot be mapped safely.",
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id&limit=2`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new RenderUserResolutionError("The authenticated user could not be resolved.");
  }
  const rows = (await response.json()) as Array<{ id?: unknown }>;
  if (rows.length !== 1 || typeof rows[0]?.id !== "string" || !UUID_PATTERN.test(rows[0].id)) {
    throw new RenderUserResolutionError(
      "The authenticated user did not resolve to exactly one UUID profile.",
    );
  }
  return rows[0].id;
}
