import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addParticipant } from "../../actions";
import { CONSTRUCTION_SERVICES } from "@/lib/constants";
import MilestoneBuilder from "@/components/MilestoneBuilder";
import Link from "next/link";

export default async function AddParticipantPage({ params, searchParams }) {
  const supabase = createClient();
  const { id: projectId } = params;
  const { trade, artisan: selectedArtisanId } = searchParams || {};

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, artisan_id, title, currency")
    .eq("id", projectId)
    .single();

  if (!project || project.client_id !== user.id) {
    redirect(`/projects/${projectId}`);
  }

  // --- Étape 2 : l'artisan est choisi, on définit sa prestation ---
  if (selectedArtisanId) {
    const { data: artisan } = await supabase
      .from("artisan_profiles")
      .select("id, trade, currency, profiles ( full_name )")
      .eq("id", selectedArtisanId)
      .single();

    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-heading text-2xl font-bold">Prestation de {artisan?.profiles?.full_name}</h1>
        <p className="mt-1 text-sm text-gray-500">{artisan?.trade} — projet "{project.title}"</p>
        <p className="mt-3 text-sm text-gray-500">
          Chaque artisan est indépendant : renseigne ici uniquement les termes convenus avec {artisan?.profiles?.full_name}, séparément du reste du projet.
        </p>

        {searchParams?.error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{searchParams.error}</p>
        )}

        <form action={addParticipant} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="artisanId" value={selectedArtisanId} />

          <div>
            <label className="mb-1 block text-sm font-medium">Description de sa prestation</label>
            <textarea
              name="description"
              rows={3}
              placeholder="ex: Installation électrique complète du rez-de-chaussée"
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Montant convenu avec cet artisan ({project.currency || "XOF"})
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <MilestoneBuilder trade={artisan?.trade} />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand py-3 font-heading font-bold text-white hover:bg-brand-dark"
          >
            Ajouter et créer son contrat
          </button>
        </form>
      </div>
    );
  }

  // --- Étape 1 : choisir l'artisan à ajouter ---
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
              <Link
                href={`/projects/${projectId}/add-participant?artisan=${a.id}`}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                Choisir
              </Link>
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
