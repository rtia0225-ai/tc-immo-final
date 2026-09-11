import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addParticipant } from "../../actions";
import { CONSTRUCTION_SERVICES } from "@/lib/constants";
import Link from "next/link";

export default async function AddParticipantPage({ params, searchParams }) {
  const supabase = createClient();
  const { id: projectId } = params;
  const { trade } = searchParams || {};

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, artisan_id, title")
    .eq("id", projectId)
    .single();

  // Réservé au client du projet
  if (!project || project.client_id !== user.id) {
    redirect(`/projects/${projectId}`);
  }

  const { data: existingParticipants } = await supabase
    .from("project_participants")
    .select("artisan_id")
    .eq("project_id", projectId);

  const excludedIds = [project.artisan_id, ...(existingParticipants || []).map((p) => p.artisan_id)];

  let query = supabase
    .from("artisan_profiles")
    .select(`id, trade, is_verified, profiles ( full_name, city, avatar_url )`)
    .order("is_verified", { ascending: false });

  if (trade) query = query.eq("trade", trade);

  const { data: allArtisans } = await query;
  const artisans = (allArtisans || []).filter((a) => !excludedIds.includes(a.id));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold text-ink">Ajouter un participant</h1>
      <p className="mt-1 text-sm text-gray-500">Au projet "{project.title}"</p>

      <form action={`/projects/${projectId}/add-participant`} className="mt-4 flex gap-2">
        <select
          name="trade"
          defaultValue={trade || ""}
          className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="">Tous les métiers</option>
          {CONSTRUCTION_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">
          Filtrer
        </button>
      </form>

      {artisans.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucun artisan disponible pour ce métier.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {artisans.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.profiles.avatar_url} alt={a.profiles?.full_name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-300">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-ink">{a.profiles?.full_name}</p>
                  <p className="text-xs text-gray-500">{a.trade} · {a.profiles?.city}</p>
                </div>
              </div>
              <form action={addParticipant}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="artisanId" value={a.id} />
                <button type="submit" className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark">
                  Ajouter
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <Link href={`/projects/${projectId}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        ← Retour au projet
      </Link>
    </div>
  );
}
