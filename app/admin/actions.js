"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");
  return user;
}

export async function addAdminNote(formData) {
  const supabase = createClient();
  const user = await requireAdmin(supabase);

  const artisanId = formData.get("artisanId");
  const note = formData.get("note");

  await supabase.from("artisan_admin_notes").insert({
    artisan_id: artisanId,
    note,
    created_by: user.id,
  });

  redirect(`/admin/artisans/${artisanId}`);
}

export async function toggleVerified(formData) {
  const supabase = createClient();
  await requireAdmin(supabase);

  const artisanId = formData.get("artisanId");
  const isVerified = formData.get("isVerified") === "true";

  await supabase
    .from("artisan_profiles")
    .update({ is_verified: !isVerified })
    .eq("id", artisanId);

  redirect(`/admin/artisans/${artisanId}`);
}
