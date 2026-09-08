"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Étape "Sécurisez vos travaux" : le client valide un devis avec l'artisan,
// ce qui crée le projet. Le statut part directement en "awaiting_payment"
// (devis accepté, en attente du premier paiement) et les 5 étapes de
// chronogramme standards se créent automatiquement (voir schema.sql).
export async function createProject(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const artisanId = formData.get("artisanId");
  const title = formData.get("title");
  const description = formData.get("description");
  const amount = formData.get("amount");
  const currency = formData.get("currency") || "XOF";

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      client_id: user.id,
      artisan_id: artisanId,
      title,
      description,
      amount,
      currency,
      status: "awaiting_payment",
    })
    .select("id")
    .single();

  if (error) {
    return redirect(
      `/projects/new?artisan=${artisanId}&error=${encodeURIComponent(error.message)}`
    );
  }

  // Relie automatiquement la conversation existante à ce projet, si elle existe déjà
  await supabase
    .from("conversations")
    .update({ project_id: project.id })
    .eq("client_id", user.id)
    .eq("artisan_id", artisanId)
    .is("project_id", null);

  redirect(`/projects/${project.id}`);
}

// NOTE : ceci ne fait qu'avancer le statut en base. L'intégration réelle
// avec un prestataire de paiement (Stripe Connect, CinetPay...) doit se
// faire ici avant de changer le statut en production.
export async function advanceProjectStatus(formData) {
  const supabase = createClient();
  const projectId = formData.get("projectId");
  const newStatus = formData.get("newStatus");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("projects")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  await supabase.from("escrow_events").insert({
    project_id: projectId,
    event_type: newStatus,
    metadata: { triggered_by: user.id },
  });

  redirect(`/projects/${projectId}`);
}

