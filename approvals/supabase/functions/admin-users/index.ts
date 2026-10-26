// Supabase Edge Function: lets an admin create and manage logins from the website.
// The service-role key stays on the server; the browser never sees it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ROLES = ["admin", "approver", "finance"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Who is calling?
    const caller = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json({ error: "Please sign in again." }, 401);

    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "admin") return json({ error: "Only admins can manage logins." }, 403);

    const body = await req.json();

    if (body.action === "list") {
      const { data, error } = await admin.from("profiles").select("id,email,full_name,role,created_at").order("created_at");
      if (error) throw error;
      return json({ users: data, me: user.id });
    }

    if (body.action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const full_name = String(body.full_name ?? "").trim();
      const role = String(body.role ?? "");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
      if (password.length < 8) return json({ error: "The password needs at least 8 characters." }, 400);
      if (!full_name) return json({ error: "Enter the person's name." }, 400);
      if (!ROLES.includes(role)) return json({ error: "Choose a role." }, 400);

      const { data: created, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (error) return json({ error: error.message }, 400);
      const { error: pErr } = await admin.from("profiles").insert({ id: created.user.id, email, full_name, role });
      if (pErr) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: pErr.message }, 400);
      }
      return json({ ok: true });
    }

    if (body.action === "set_role") {
      if (body.id === user.id) return json({ error: "You cannot change your own role." }, 400);
      if (!ROLES.includes(body.role)) return json({ error: "Choose a role." }, 400);
      const { error } = await admin.from("profiles").update({ role: body.role }).eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "reset_password") {
      const password = String(body.password ?? "");
      if (password.length < 8) return json({ error: "The password needs at least 8 characters." }, 400);
      const { error } = await admin.auth.admin.updateUserById(body.id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (body.action === "delete") {
      if (body.id === user.id) return json({ error: "You cannot remove your own login." }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return json({ error: (e as Error).message ?? "Something went wrong." }, 500);
  }
});
