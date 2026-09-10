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

  // Génère le contrat tripartite, à signer par les deux parties avant
  // le démarrage réel des travaux.
  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const { data: artisanData } = await supabase
    .from("artisan_profiles")
    .select("trade, profiles ( full_name )")
    .eq("id", artisanId)
    .single();

  const contractContent = `CONTRAT DE PRESTATION — TC-IMMO

Entre le client ${clientProfile?.full_name || ""} et le prestataire ${artisanData?.profiles?.full_name || ""} (${artisanData?.trade || ""}).

Objet : ${title}
Description : ${description || "Non précisée"}
Montant convenu : ${amount} ${currency}

Le paiement du client est séquestré sur la plateforme TC-Immo et libéré au prestataire au fur et à mesure de la validation des étapes du chantier convenues (Fondations, Dalle, Murs, Toiture, Finitions).

En signant ce contrat, les deux parties reconnaissent avoir convenu de ces termes et acceptent de débuter les travaux dans ce cadre.`;

  await supabase.from("contracts").insert({
    project_id: project.id,
    content: contractContent,
  });

  redirect(`/projects/${project.id}/contract`);
}

// Signature de consentement (horodatée) — pas une signature électronique
// légale certifiée, juste une trace de l'accord de chaque partie.
export async function signContract(formData) {
  const supabase = createClient();
  const contractId = formData.get("contractId");
  const projectId = formData.get("projectId");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, artisan_id")
    .eq("id", projectId)
    .single();

  if (!project) redirect(`/projects/${projectId}/contract`);

  const updates = {};
  if (project.client_id === user.id) updates.client_signed_at = new Date().toISOString();
  if (project.artisan_id === user.id) updates.artisan_signed_at = new Date().toISOString();

  await supabase.from("contracts").update(updates).eq("id", contractId);

  redirect(`/projects/${projectId}/contract`);
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

