import { requestAppointment } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewAppointmentPage({ searchParams }) {
  const artisanId = searchParams?.artisan;
  const projectId = searchParams?.project;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const currentPath = `/appointments/new?artisan=${artisanId}${projectId ? `&project=${projectId}` : ""}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  if (user.id === artisanId) {
    redirect(`/artisans/${artisanId}`);
  }

  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select("id, trade, profiles ( full_name )")
    .eq("id", artisanId)
    .single();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-brand-dark">
        Prendre rendez-vous
      </h1>
      {artisan && (
        <p className="mb-6 text-gray-600">
          avec {artisan.profiles?.full_name} ({artisan.trade})
        </p>
      )}

      {searchParams?.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      <form action={requestAppointment} className="flex flex-col gap-4">
        <input type="hidden" name="artisanId" value={artisanId} />
        {projectId && (
          <input type="hidden" name="projectId" value={projectId} />
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Date et heure souhaitées
          </label>
          <input
            type="datetime-local"
            name="scheduledAt"
            required
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Précisions (optionnel)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Sujet de l'appel, contexte du projet..."
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <p className="text-xs text-gray-500">
          Le lien de réunion (Meet, Zoom...) sera ajouté par l'artisan lors
          de la confirmation. Un SMS de rappel est envoyé avant le
          rendez-vous.
        </p>

        <button
          type="submit"
          className="rounded-lg bg-brand py-2 font-medium text-white hover:bg-brand-dark"
        >
          Envoyer la demande de rendez-vous
        </button>
      </form>
    </div>
  );
}
