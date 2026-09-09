import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CI_CITIES, CONSTRUCTION_SERVICES, RECOMMENDATION_OPTIONS } from "@/lib/constants";

export default async function ArtisansPage({ searchParams }) {
  const supabase = createClient();
  const { trade, city, recommendation, house_type } = searchParams || {};

  // Le "type de maison" ne filtre jamais les résultats : par défaut, un
  // artisan est considéré comme capable de traiter tous les types de
  // construction. On l'enregistre uniquement à des fins statistiques
  // internes (identifier les besoins en spécialités selon le type de
  // bien recherché).
  if (house_type) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("search_analytics").insert({
      house_type,
      trade: trade || null,
      city: city || null,
      recommendation: recommendation || null,
      searched_by: user?.id || null,
    });
  }

  const { data: allArtisans } = await supabase
    .from("artisan_profiles")
    .select(
      `id, trade, bio, years_experience, is_verified, pricing_info,
       services, projects_completed, mobility_scope, mobility_cities,
       profiles ( full_name, city, avatar_url )`
    )
    .order("is_verified", { ascending: false });

  let artisans = (allArtisans || []).filter((a) => {
    // Métier : correspond au métier principal OU à l'un des services proposés
    const matchesTrade =
      !trade || a.trade === trade || (a.services || []).includes(trade);

    // Ville : correspond à sa ville de base, à sa zone de mobilité déclarée,
    // ou il est disponible partout en Côte d'Ivoire
    const matchesCity =
      !city ||
      a.profiles?.city === city ||
      a.mobility_scope === "all" ||
      (a.mobility_cities || []).includes(city);

    return matchesTrade && matchesCity;
  });

  // "3 recommandations" : les 3 meilleurs profils (vérifiés en priorité,
  // puis les plus expérimentés). "Toute la liste" : aucune limite.
  if (recommendation === "top3") {
    artisans = [...artisans]
      .sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
      .slice(0, 3);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Trouver un artisan</h1>

      {/* Barre de recherche, reprend les mêmes critères que l'accueil */}
      <form action="/artisans" className="mt-4 flex flex-wrap gap-2">
        <select name="trade" defaultValue={trade || ""} className="flex-1 rounded-lg border border-gray-300 p-2 text-sm">
          <option value="">Tous les métiers</option>
          {CONSTRUCTION_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="city" defaultValue={city || ""} className="flex-1 rounded-lg border border-gray-300 p-2 text-sm">
          <option value="">Toutes les villes</option>
          {CI_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="recommendation" defaultValue={recommendation || ""} className="flex-1 rounded-lg border border-gray-300 p-2 text-sm">
          <option value="">Toute la liste</option>
          {RECOMMENDATION_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Filtrer
        </button>
      </form>

      {recommendation === "top3" && (
        <p className="mt-3 text-sm text-gray-500">Nos 3 recommandations les plus expérimentées.</p>
      )}

      {artisans.length === 0 ? (
        <p className="mt-8 text-gray-500">Aucun artisan ne correspond à ta recherche.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {artisans.map((a) => (
            <Link
              key={a.id}
              href={`/artisans/${a.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  {a.is_verified && (
                    <span className="mb-1 inline-block rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                      {a.trade}
                    </span>
                  )}
                  <p className="font-heading font-bold">{a.profiles?.full_name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    📍 {a.profiles?.city || "Côte d'Ivoire"}
                    {a.mobility_scope === "all" && " · Toute la CI"}
                  </p>
                </div>
              </div>

              {a.services && a.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {a.services.map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">{a.projects_completed || 0} projets réalisés</span>
                <span className="font-medium text-forest">Voir le profil →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
