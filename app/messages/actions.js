"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyNewMessage } from "@/lib/notifications";
import { containsPhoneNumber } from "@/lib/phoneFilter";

export async function startConversation(formData) {
  const supabase = createClient();
  const artisanId = formData.get("artisanId");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Cherche une conversation existante (hors projet) entre ce client et cet artisan
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", user.id)
    .eq("artisan_id", artisanId)
    .is("project_id", null)
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ client_id: user.id, artisan_id: artisanId })
    .select("id")
    .single();

  if (error) {
    return redirect(`/artisans?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/messages/${created.id}`);
}

export async function sendMessage(formData) {
  const supabase = createClient();
  const conversationId = formData.get("conversationId");
  const content = formData.get("content");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !content?.trim()) return;

  // Interdiction d'échanger des numéros de téléphone dans les messages :
  // les échanges doivent rester sur la plateforme (rendez-vous, paiement
  // séquestré). Le message n'est pas envoyé, la personne doit le reformuler.
  if (containsPhoneNumber(content)) {
    redirect(
      `/messages/${conversationId}?error=${encodeURIComponent(
        "Ton message contient un numéro de téléphone. Les échanges de coordonnées ne sont pas autorisés ici — utilise la messagerie ou les rendez-vous de la plateforme."
      )}`
    );
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
  });

  // Détermine qui n'est pas l'expéditeur pour le notifier par SMS
  const { data: conversation } = await supabase
    .from("conversations")
    .select("client_id, artisan_id")
    .eq("id", conversationId)
    .single();

  if (conversation) {
    const recipientId =
      conversation.client_id === user.id
        ? conversation.artisan_id
        : conversation.client_id;
    await notifyNewMessage(recipientId);
  }

  redirect(`/messages/${conversationId}`);
}

// Envoi d'une note vocale : reçoit l'audio enregistré depuis le micro du
// téléphone (voir components/VoiceRecorder.jsx), le stocke dans le bucket
// "voice-notes", puis crée le message correspondant.
// NOTE IMPORTANTE : le filtre anti-numéro de téléphone ne s'applique
// qu'aux messages texte — il ne peut pas "écouter" l'audio pour vérifier
// si un numéro y est dit à l'oral.
export async function sendVoiceMessage(formData) {
  const supabase = createClient();
  const conversationId = formData.get("conversationId");
  const file = formData.get("audio");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !file || typeof file === "string" || file.size === 0) {
    return { error: "Échec de l'enregistrement." };
  }

  const path = `${user.id}/${Date.now()}.webm`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("voice-notes")
    .upload(path, arrayBuffer, { contentType: file.type || "audio/webm" });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage.from("voice-notes").getPublicUrl(path);

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    audio_url: publicUrlData.publicUrl,
  });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("client_id, artisan_id")
    .eq("id", conversationId)
    .single();

  if (conversation) {
    const recipientId =
      conversation.client_id === user.id
        ? conversation.artisan_id
        : conversation.client_id;
    await notifyNewMessage(recipientId);
  }

  return { success: true };
}
