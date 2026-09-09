"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyNewAppointment } from "@/lib/notifications";

export async function requestAppointment(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const artisanId = formData.get("artisanId");
  const projectId = formData.get("projectId") || null;
  const scheduledAt = formData.get("scheduledAt"); // datetime-local
  const notes = formData.get("notes");

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      client_id: user.id,
      artisan_id: artisanId,
      project_id: projectId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      notes,
      status: "proposed",
      proposed_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return redirect(
      `/appointments/new?artisan=${artisanId}&error=${encodeURIComponent(error.message)}`
    );
  }

  // Notifie l'artisan (SMS + rappel) — voir lib/notifications.js
  await notifyNewAppointment(appointment.id);

  redirect("/appointments");
}

// Accepte le créneau tel que proposé par l'autre partie, et peut y joindre
// un lien de réunion (Meet, Zoom...). Accessible à qui N'A PAS proposé
// ce créneau — client ou artisan, selon le sens de la dernière proposition.
export async function confirmAppointment(formData) {
  const supabase = createClient();
  const appointmentId = formData.get("appointmentId");
  const meetingLink = formData.get("meetingLink");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("appointments")
    .update({
      status: "confirmed",
      meeting_link: meetingLink || null,
    })
    .eq("id", appointmentId)
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
    .neq("proposed_by", user.id);

  redirect("/appointments");
}

// Contre-proposition : client ou artisan propose une autre date/heure.
// Remet le rendez-vous en attente de confirmation par l'autre partie.
export async function proposeNewTime(formData) {
  const supabase = createClient();
  const appointmentId = formData.get("appointmentId");
  const scheduledAt = formData.get("scheduledAt");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("appointments")
    .update({
      scheduled_at: new Date(scheduledAt).toISOString(),
      status: "proposed",
      proposed_by: user.id,
      meeting_link: null,
    })
    .eq("id", appointmentId)
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`);

  await notifyNewAppointment(appointmentId);

  redirect("/appointments");
}

export async function cancelAppointment(formData) {
  const supabase = createClient();
  const appointmentId = formData.get("appointmentId");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`);

  redirect("/appointments");
}
