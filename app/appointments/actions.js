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

// L'artisan confirme le RDV et peut y joindre un lien de réunion (Meet, Zoom...)
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
    .eq("artisan_id", user.id);

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
