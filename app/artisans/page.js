import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CI_CITIES, CONSTRUCTION_SERVICES, RECOMMENDATION_OPTIONS } from "@/lib/constants";

export default async function ArtisansPage({ searchParams }) {
  const supabase = createClient();
  const { trade, city, recommendation, house_type } = searchParams || {};

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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl font-extrabold text-ink">Trouver un artisan</h1>

      <form action="/artisans" className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-card">
        <select name="trade" defaultValue={trade || ""} className="flex-1 rounded-xl border border-gray-200 p-2.5 text-sm hover:border-brand focus:border-brand focus:outline-none">
          <option value="">Tous les métiers</option>
          {CONSTRUCTION_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="city" defaultValue={city || ""} className="flex-1 rounded-xl border border-gray-200 p-2.5 text-sm hover:border-brand focus:border-brand focus:outline-none">
          <option value="">Toutes les villes</option>
          {CI_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="recommendation" defaultValue={recommendation || ""} className="flex-1 rounded-xl border border-gray-200 p-2.5 text-sm hover:border-brand focus:border-brand focus:outline-none">
          <option value="">Toute la liste</option>
          {RECOMMENDATION_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-dark">
          Filtrer
        </button>
      </form>

      {recommendation === "top3" && (
        <p className="mt-4 text-sm font-medium text-gold">★ Nos 3 recommandations les plus expérimentées</p>
      )}

      {artisans.length === 0 ? (
        <p className="mt-10 text-gray-500">Aucun artisan ne correspond à ta recherche.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {artisans.map((a) => (
            <Link
              key={a.id}
              href={`/artisans/${a.id}`}
              className="rounded-2xl bg-white p-5 shadow-card hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="flex items-start gap-3">
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.profiles.avatar_url}
                    alt={a.profiles?.full_name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-forest-light"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-light to-gold-light font-heading text-sm font-bold text-forest">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  {a.is_verified && (
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-forest-light px-2 py-0.5 text-[10px] font-bold text-forest">
                      ✓ Vérifié
                    </span>
                  )}
                  <p className="font-heading font-bold text-ink">{a.profiles?.full_name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {a.trade} · {a.profiles?.city || "Côte d'Ivoire"}
                    {a.mobility_scope === "all" && " · Toute la CI"}
                  </p>
                </div>
              </div>

              {a.services && a.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.services.map((s) => (
                    <span key={s} className="rounded-full bg-azure-light px-2.5 py-0.5 text-[11px] font-medium text-azure-dark">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="text-gray-500">{a.projects_completed || 0} projets réalisés</span>
                <span className="font-bold text-brand">Voir le profil →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
