// NOTE IMPORTANTE :
// Ce fichier ne fait qu'écrire les événements en base pour l'instant.
// Pour envoyer de vrais SMS (rappel de RDV avec lien, notification de
// nouveau message), il faut brancher un prestataire comme Twilio,
// Vonage, ou un fournisseur local (ex: Orange SMS API, MTN).
//
// Exemple d'intégration Twilio (à décommenter une fois le compte créé
// et les variables TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM
// ajoutées dans .env.local et sur Vercel) :
//
// import twilio from "twilio";
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// await client.messages.create({
//   to: phoneNumber,
//   from: process.env.TWILIO_FROM,
//   body: message,
// });

import { createClient } from "@/lib/supabase/server";

async function sendSms(phoneNumber, message) {
  if (!phoneNumber) return;
  // TODO : remplacer ce console.log par un vrai appel au prestataire SMS.
  console.log(`[SMS à ${phoneNumber}] ${message}`);
}

export async function notifyNewAppointment(appointmentId) {
  const supabase = createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `scheduled_at, meeting_link,
       artisan_id, profiles:artisan_id ( phone, full_name )`
    )
    .eq("id", appointmentId)
    .single();

  if (!appointment) return;

  const date = new Date(appointment.scheduled_at).toLocaleString("fr-FR");
  await sendSms(
    appointment.profiles?.phone,
    `TC-Immo : nouveau rendez-vous demandé le ${date}. Connectez-vous pour confirmer.`
  );
}

export async function notifyAppointmentReminder(appointmentId) {
  const supabase = createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `scheduled_at, meeting_link,
       client:client_id ( phone ),
       artisan:artisan_id ( profiles:id ( phone ) )`
    )
    .eq("id", appointmentId)
    .single();

  if (!appointment) return;

  const link = appointment.meeting_link
    ? ` Lien : ${appointment.meeting_link}`
    : "";
  const message = `TC-Immo : rappel de votre rendez-vous.${link}`;

  await sendSms(appointment.client?.phone, message);
  await sendSms(appointment.artisan?.profiles?.phone, message);
}

export async function notifyNewMessage(recipientProfileId) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", recipientProfileId)
    .single();

  if (!profile) return;

  await sendSms(profile.phone, "TC-Immo : vous avez reçu un nouveau message.");
}
