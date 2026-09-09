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
    const matchesTrade =
      !trade || a.trade === trade || (a.services || []).includes(trade);
    const matchesCity =
      !city ||
      a.profiles?.city === city ||
      a.mobility_scope === "all" ||
      (a.mobility_cities || []).includes(city);
    return matchesTrade && matchesCity;
  });

  if (recommendation === "top3") {
    artisans = [...artisans]
      .sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
      .slice(0, 3);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-heading text-2xl font-medium text-ink">Trouver un artisan</h1>

      <form action="/artisans" className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
        <select name="trade" defaultValue={trade || ""} className="bg-white p-3 text-sm text-ink focus:outline-none">
          <option value="">Tous les métiers</option>
          {CONSTRUCTION_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="city" defaultValue={city || ""} className="bg-white p-3 text-sm text-ink focus:outline-none">
          <option value="">Toutes les villes</option>
          {CI_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="recommendation" defaultValue={recommendation || ""} className="bg-white p-3 text-sm text-ink focus:outline-none">
          <option value="">Toute la liste</option>
          {RECOMMENDATION_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-ink text-sm font-medium text-stone hover:bg-black">
          Filtrer
        </button>
      </form>

      {recommendation === "top3" && (
        <p className="mt-4 text-sm text-ink/50">Nos 3 recommandations les plus expérimentées.</p>
      )}

      {artisans.length === 0 ? (
        <p className="mt-10 text-ink/50">Aucun artisan ne correspond à ta recherche.</p>
      ) : (
        <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {artisans.map((a) => (
            <Link
              key={a.id}
              href={`/artisans/${a.id}`}
              className="flex flex-col gap-3 bg-white p-5 hover:bg-stone"
            >
              <div className="flex items-start gap-3">
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.profiles.avatar_url}
                    alt={a.profiles?.full_name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line font-heading text-sm text-ink/40">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-heading font-medium text-ink">{a.profiles?.full_name}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {a.trade} · {a.profiles?.city || "Côte d'Ivoire"}
                    {a.mobility_scope === "all" && " · Toute la CI"}
                  </p>
                  {a.is_verified && (
                    <p className="mt-1 text-xs font-medium text-forest">Profil vérifié</p>
                  )}
                </div>
              </div>

              {a.services && a.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {a.services.map((s) => (
                    <span key={s} className="border border-line px-2 py-0.5 text-[11px] text-ink/60">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
                <span className="text-ink/50">{a.projects_completed || 0} projets réalisés</span>
                <span className="font-medium text-forest">Voir le profil</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
