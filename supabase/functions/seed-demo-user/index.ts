// Seeds a demo user for testing. Idempotent: returns existing user if already created.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_USERS = [
  { email: "demo@armory.test", password: "DemoUser!2026", name: "Demo User" },
  { email: "admin@armory.test", password: "AdminUser!2026", name: "Admin User" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results: Array<Record<string, unknown>> = [];

  for (const u of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name, demo: true },
    });

    if (error) {
      // already exists? fetch and report
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users.find((x) => x.email === u.email);
      results.push({
        email: u.email,
        password: u.password,
        status: existing ? "already_exists" : "error",
        error: existing ? null : error.message,
        id: existing?.id ?? null,
      });
    } else {
      results.push({
        email: u.email,
        password: u.password,
        status: "created",
        id: data.user?.id,
      });
    }
  }

  return new Response(JSON.stringify({ users: results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
