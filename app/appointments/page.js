import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { confirmAppointment, cancelAppointment, proposeNewTime } from "./actions";

const STATUS_LABELS = {
  proposed: "En attente de confirmation",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

export default async function AppointmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isArtisan = profile?.role === "artisan";

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `id, scheduled_at, status, meeting_link, notes, proposed_by,
       client:client_id ( full_name ),
       artisan:artisan_id ( trade, profiles ( full_name ) )`
    )
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
    .order("scheduled_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        Mes rendez-vous
      </h1>

      {!appointments || appointments.length === 0 ? (
        <p className="text-gray-600">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((a) => {
            // Celui qui a proposé le créneau doit attendre l'autre —
            // ce n'est que l'autre partie qui peut confirmer ce créneau précis.
            const waitingOnOther = a.status === "proposed" && a.proposed_by !== user.id;
            const isPending = a.status === "proposed" || a.status === "confirmed";

            return (
              <div
                key={a.id}
                className="rounded-lg border border-brand-light bg-white p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">
                    {new Date(a.scheduled_at).toLocaleString("fr-FR")}
                  </span>
                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Avec{" "}
                  {isArtisan
                    ? a.client?.full_name
                    : a.artisan?.profiles?.full_name}
                </p>
                {a.notes && (
                  <p className="mt-1 text-sm text-gray-500">{a.notes}</p>
                )}
                {a.status === "proposed" && (
                  <p className="mt-1 text-xs text-gray-400">
                    {a.proposed_by === user.id
                      ? "En attente de la réponse de l'autre partie"
                      : "Ce créneau t'a été proposé"}
                  </p>
                )}

                {a.meeting_link && a.status === "confirmed" && (
                  <a
                    href={a.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    Rejoindre l'appel →
                  </a>
                )}

                {/* Confirmer le créneau proposé par l'autre partie */}
                {waitingOnOther && (
                  <form
                    action={confirmAppointment}
                    className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row"
                  >
                    <input type="hidden" name="appointmentId" value={a.id} />
                    <input
                      name="meetingLink"
                      placeholder="Lien Meet / Zoom (optionnel)"
                      className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                    >
                      Confirmer ce créneau
                    </button>
                  </form>
                )}

                {/* Proposer un autre créneau, à tout moment tant que ce n'est pas annulé/terminé */}
                {isPending && (
                  <details className="mt-3 border-t border-gray-100 pt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-brand">
                      Proposer un autre jour/heure
                    </summary>
                    <form action={proposeNewTime} className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="appointmentId" value={a.id} />
                      <input
                        type="datetime-local"
                        name="scheduledAt"
                        required
                        className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                      >
                        Envoyer la proposition
                      </button>
                    </form>
                  </details>
                )}

                {a.status !== "cancelled" && a.status !== "completed" && (
                  <form action={cancelAppointment} className="mt-2">
                    <input type="hidden" name="appointmentId" value={a.id} />
                    <button
                      type="submit"
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      Annuler ce rendez-vous
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
