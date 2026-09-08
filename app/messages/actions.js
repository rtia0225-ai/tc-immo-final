"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyNewMessage } from "@/lib/notifications";

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
