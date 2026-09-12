"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SINGLE_INSTALLMENT_TRADES, MIN_INSTALLMENTS_OTHER_TRADES } from "@/lib/constants";

// Vérifie que l'échéancier respecte la règle du métier : une seule
// échéance (100%) pour Architecte/Topographe, au moins 5 pour tous les
// autres métiers (maçonnerie en tête). Retourne un message d'erreur en
// français si la règle n'est pas respectée, sinon null.
function validateInstallmentRule(trade, milestoneTitles) {
  const requiredDoc = SINGLE_INSTALLMENT_TRADES[trade];
  if (requiredDoc) {
    if (milestoneTitles.length !== 1) {
      return `Pour ce métier, l'échéancier doit contenir une seule étape, payée à la livraison du ${requiredDoc}.`;
    }
  } else if (milestoneTitles.length < MIN_INSTALLMENTS_OTHER_TRADES) {
    return `Pour ce métier, l'échéancier doit contenir au moins ${MIN_INSTALLMENTS_OTHER_TRADES} étapes — le paiement ne peut pas se faire en une seule fois.`;
  }
  return null;
}

// Génère le texte d'un contrat de prestation pour UN artisan précis
// (principal ou participant), avec son propre échéancier de paiement.
function buildContractContent({ clientName, artisanName, trade, title, description, amount, currency, milestoneRows }) {
  const scheduleText = milestoneRows
    .map((m) => `  - ${m.title} : ${m.payment_percentage}% (${m.amount} ${currency})`)
    .join("\n");

  return `CONTRAT DE PRESTATION — TC-IMMO

Entre le client ${clientName || ""} et le prestataire ${artisanName || ""} (${trade || ""}).

Objet : ${title}
Description : ${description || "Non précisée"}
Montant convenu : ${amount} ${currency}

Échéancier de paiement convenu :
${scheduleText || "  (aucune étape définie)"}

Le paiement du client est séquestré sur la plateforme TC-Immo. Chaque montant listé ci-dessus n'est libéré au prestataire qu'après validation, par l'artisan, de l'étape correspondante.

Chaque prestataire du projet est indépendant : ce contrat ne concerne que sa propre prestation, à ses propres conditions.

En signant ce contrat, les deux parties reconnaissent avoir convenu de ces termes et acceptent de débuter les travaux dans ce cadre.`;
}

// Étape "Sécurisez vos travaux" : le client valide un devis avec l'artisan
// principal, ce qui crée le projet. Seul le client peut initier cette
// action (vérifié aussi au niveau de la page /projects/new).
export async function createProject(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (requesterProfile?.role === "artisan") {
    redirect("/dashboard");
  }

  const artisanId = formData.get("artisanId");
  const title = formData.get("title");
  const description = formData.get("description");
  const amount = formData.get("amount");
  const currency = formData.get("currency") || "XOF";

  const milestoneTitles = formData.getAll("milestoneTitle");
  const milestonePercentages = formData.getAll("milestonePercentage");

  const { data: artisanForRule } = await supabase
    .from("artisan_profiles")
    .select("trade")
    .eq("id", artisanId)
    .single();

  const ruleError = validateInstallmentRule(artisanForRule?.trade, milestoneTitles);
  if (ruleError) {
    redirect(`/projects/new?artisan=${artisanId}&error=${encodeURIComponent(ruleError)}`);
  }

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

  const totalAmount = Number(amount) || 0;
  const milestoneRows = milestoneTitles.map((t, i) => {
    const pct = Number(milestonePercentages[i]) || 0;
    return {
      project_id: project.id,
      artisan_id: artisanId,
      title: t,
      order_index: i + 1,
      payment_percentage: pct,
      amount: Math.round((totalAmount * pct) / 100),
    };
  });

  if (milestoneRows.length > 0) {
    const { error: milestonesError } = await supabase
      .from("project_milestones")
      .insert(milestoneRows);
    if (milestonesError) {
      console.error("Échec de création de l'échéancier :", milestonesError.message);
    }
  }

  await supabase
    .from("conversations")
    .update({ project_id: project.id })
    .eq("client_id", user.id)
    .eq("artisan_id", artisanId)
    .is("project_id", null);

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

  const contractContent = buildContractContent({
    clientName: clientProfile?.full_name,
    artisanName: artisanData?.profiles?.full_name,
    trade: artisanData?.trade,
    title,
    description,
    amount,
    currency,
    milestoneRows,
  });

  await supabase.from("contracts").insert({
    project_id: project.id,
    artisan_id: artisanId,
    content: contractContent,
  });

  redirect(`/projects/${project.id}/contract/${artisanId}`);
}

// Signature de consentement (horodatée) — pas une signature électronique
// légale certifiée, juste une trace de l'accord de chaque partie.
export async function signContract(formData) {
  const supabase = createClient();
  const contractId = formData.get("contractId");
  const projectId = formData.get("projectId");
  const artisanId = formData.get("artisanId");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();

  const updates = {};
  if (project?.client_id === user.id) updates.client_signed_at = new Date().toISOString();
  if (artisanId === user.id) updates.artisan_signed_at = new Date().toISOString();

  await supabase.from("contracts").update(updates).eq("id", contractId);

  redirect(`/projects/${projectId}/contract/${artisanId}`);
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

// Le client ajoute un autre artisan (n'importe quel métier) à un projet
// déjà démarré, avec sa PROPRE prestation, son PROPRE montant et son
// PROPRE échéancier — indépendant du reste du projet (pas de prix groupé).
export async function addParticipant(formData) {
  const supabase = createClient();
  const projectId = formData.get("projectId");
  const artisanId = formData.get("artisanId");
  const description = formData.get("description");
  const amount = formData.get("amount");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, title, currency")
    .eq("id", projectId)
    .single();

  if (project?.client_id !== user.id) {
    redirect(`/projects/${projectId}`);
  }

  const currency = project.currency || "XOF";
  const milestoneTitles = formData.getAll("milestoneTitle");
  const milestonePercentages = formData.getAll("milestonePercentage");

  const { data: artisanForRule } = await supabase
    .from("artisan_profiles")
    .select("trade")
    .eq("id", artisanId)
    .single();

  const ruleError = validateInstallmentRule(artisanForRule?.trade, milestoneTitles);
  if (ruleError) {
    redirect(`/projects/${projectId}/add-participant?artisan=${artisanId}&error=${encodeURIComponent(ruleError)}`);
  }

  const { data: participant, error } = await supabase
    .from("project_participants")
    .insert({
      project_id: projectId,
      artisan_id: artisanId,
      amount,
      description,
      currency,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/projects/${projectId}/add-participant?error=${encodeURIComponent(error.message)}`);
  }

  const totalAmount = Number(amount) || 0;
  const milestoneRows = milestoneTitles.map((t, i) => {
    const pct = Number(milestonePercentages[i]) || 0;
    return {
      project_id: projectId,
      artisan_id: artisanId,
      title: t,
      order_index: i + 1,
      payment_percentage: pct,
      amount: Math.round((totalAmount * pct) / 100),
    };
  });

  if (milestoneRows.length > 0) {
    await supabase.from("project_milestones").insert(milestoneRows);
  }

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

  const contractContent = buildContractContent({
    clientName: clientProfile?.full_name,
    artisanName: artisanData?.profiles?.full_name,
    trade: artisanData?.trade,
    title: `${project.title} — ${artisanData?.trade || "prestation complémentaire"}`,
    description,
    amount,
    currency,
    milestoneRows,
  });

  await supabase.from("contracts").insert({
    project_id: projectId,
    artisan_id: artisanId,
    content: contractContent,
  });

  redirect(`/projects/${projectId}/contract/${artisanId}`);
}

// Le client retire un participant ajouté (pas l'artisan principal)
export async function removeParticipant(formData) {
  const supabase = createClient();
  const projectId = formData.get("projectId");
  const participantId = formData.get("participantId");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();

  if (project?.client_id !== user.id) {
    redirect(`/projects/${projectId}`);
  }

  await supabase.from("project_participants").delete().eq("id", participantId);

  redirect(`/projects/${projectId}`);
}
