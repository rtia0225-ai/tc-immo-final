import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrustBanner from "@/components/TrustBanner";
import { CI_CITIES, CONSTRUCTION_SERVICES, HOUSE_TYPES, RECOMMENDATION_OPTIONS } from "@/lib/constants";

const STEPS = [
  {
    n: 1,
    title: "Choisissez votre prestataire",
    text: "Consultez les profils vérifiés, les avis, les réalisations. Prenez rendez-vous en visio directement avec ceux que vous avez sélectionnés.",
  },
  {
    n: 2,
    title: "Sécurisez vos travaux",
    text: "Recevez le devis de votre prestataire et signez le contrat tripartite avec la planification des travaux.",
  },
  {
    n: 3,
    title: "Payez en sécurité et à votre rythme",
    text: "C'est vous qui décidez du financement — les fonds restent séquestrés jusqu'à validation de chaque étape.",
  },
  {
    n: 4,
    title: "Suivez vos travaux",
    text: "Consultez l'état d'avancement de votre chantier depuis votre espace, où que vous soyez.",
  },
];

export default async function HomePage() {
  const supabase = createClient();

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select(
      `id, trade, is_verified, profiles ( full_name, city, avatar_url )`
    )
    .order("is_verified", { ascending: false })
    .limit(6);

  return (
    <div>
      {/* Hero — structuré en deux colonnes, pas de photo générique */}
      <section className="border-b border-line bg-stone px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-clay">France — Côte d'Ivoire</p>
            <h1 className="font-heading mt-3 text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
              Construire chez vous, en toute sécurité, depuis l'étranger
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              TC—Immo connecte la diaspora à des artisans vérifiés en Côte d'Ivoire.
              Le paiement reste séquestré, le chantier reste sous vos yeux.
            </p>
          </div>

          {/* Formulaire de recherche façon document, pas de carte flottante */}
          <form action="/artisans" className="border border-line bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Rechercher un artisan
            </p>
            <div className="mt-4 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              <div className="bg-white p-4">
                <label className="text-xs text-ink/50">Métier</label>
                <select name="trade" defaultValue="" className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-ink focus:outline-none">
                  <option value="">Tous les métiers</option>
                  {CONSTRUCTION_SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white p-4">
                <label className="text-xs text-ink/50">Type de maison</label>
                <select name="house_type" defaultValue="" className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-ink focus:outline-none">
                  <option value="">Tous types</option>
                  {HOUSE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white p-4">
                <label className="text-xs text-ink/50">Ville</label>
                <select name="city" defaultValue="" className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-ink focus:outline-none">
                  <option value="">Toutes les villes</option>
                  {CI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white p-4">
                <label className="text-xs text-ink/50">Recommandation</label>
                <select name="recommendation" defaultValue="" className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-ink focus:outline-none">
                  <option value="">Toute la liste</option>
                  {RECOMMENDATION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-ink py-3 text-sm font-medium text-stone hover:bg-black"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Artisans vérifiés */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="font-heading text-2xl font-medium text-ink">Artisans vérifiés</h2>
          <Link href="/artisans" className="text-sm text-forest hover:underline">
            Voir tous les profils
          </Link>
        </div>

        {!artisans || artisans.length === 0 ? (
          <p className="mt-6 text-ink/50">Aucun artisan pour le moment.</p>
        ) : (
          <div className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/artisans/${a.id}`}
                className="flex items-center gap-4 bg-white p-5 hover:bg-stone"
              >
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.profiles.avatar_url}
                    alt={a.profiles?.full_name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line font-heading text-sm text-ink/40">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-heading font-medium text-ink">{a.profiles?.full_name}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {a.trade} · {a.profiles?.city || "Côte d'Ivoire"}
                  </p>
                  {a.is_verified && (
                    <p className="mt-1 text-xs font-medium text-forest">Profil vérifié</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="border-b border-line pb-4">
          <h2 className="font-heading text-2xl font-medium text-ink">Comment ça marche</h2>
          <p className="mt-1 text-sm text-ink/60">Vous gérez vos travaux, nous gérons la sécurité.</p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="step-marker text-ink">{String(step.n).padStart(2, "0")}</span>
              <div>
                <p className="font-heading font-medium text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TrustBanner />
    </div>
  );
}
