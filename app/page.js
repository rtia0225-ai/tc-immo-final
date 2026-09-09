import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrustBanner from "@/components/TrustBanner";
import { CI_CITIES, CONSTRUCTION_SERVICES, HOUSE_TYPES, RECOMMENDATION_OPTIONS } from "@/lib/constants";

const STEPS = [
  {
    n: 1,
    title: "Choisissez votre prestataire",
    text: "Consultez les profils vérifiés, les avis, les réalisations. Prenez rendez-vous en visio avec ceux qui vous intéressent.",
  },
  {
    n: 2,
    title: "Sécurisez vos travaux",
    text: "Recevez le devis de votre prestataire et signez le contrat tripartite avec la planification des travaux.",
  },
  {
    n: 3,
    title: "Payez en sécurité, à votre rythme",
    text: "Les fonds restent séquestrés jusqu'à validation de chaque étape — c'est vous qui gardez la main.",
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
    .select(`id, trade, is_verified, profiles ( full_name, city, avatar_url )`)
    .order("is_verified", { ascending: false })
    .limit(6);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden px-4 py-24 text-center text-white">
        <div className="relative mx-auto max-w-2xl animate-fadeUp">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
            France — Côte d'Ivoire
          </span>
          <h1 className="font-heading mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            Construisez chez vous, en toute sécurité, depuis l'étranger
          </h1>
          <p className="mt-5 text-lg text-white/90">
            TC-Immo connecte la diaspora à des artisans vérifiés en Côte d'Ivoire.
            Paiement séquestré, chantier suivi en temps réel.
          </p>
        </div>

        {/* Carte de recherche flottante */}
        <form
          action="/artisans"
          className="relative mx-auto mt-10 w-full max-w-3xl rounded-3xl bg-white p-6 text-left shadow-2xl animate-fadeUp"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Métier</label>
              <select name="trade" defaultValue="" className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-800 hover:border-brand focus:border-brand focus:outline-none">
                <option value="">Tous les métiers</option>
                {CONSTRUCTION_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Type de maison</label>
              <select name="house_type" defaultValue="" className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-800 hover:border-brand focus:border-brand focus:outline-none">
                <option value="">Tous types</option>
                {HOUSE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Ville</label>
              <select name="city" defaultValue="" className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-800 hover:border-brand focus:border-brand focus:outline-none">
                <option value="">Toutes les villes</option>
                {CI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Recommandation</label>
              <select name="recommendation" defaultValue="" className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-800 hover:border-brand focus:border-brand focus:outline-none">
                <option value="">Toute la liste</option>
                {RECOMMENDATION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-heading font-bold text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Rechercher
          </button>
        </form>
      </section>

      {/* Artisans vérifiés */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Sélection du moment</p>
            <h2 className="font-heading mt-1 text-3xl font-extrabold text-ink">Artisans vérifiés</h2>
          </div>
          <Link href="/artisans" className="hidden text-sm font-bold text-forest hover:underline sm:block">
            Voir tous les profils →
          </Link>
        </div>

        {!artisans || artisans.length === 0 ? (
          <p className="mt-8 text-gray-500">Aucun artisan pour le moment.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/artisans/${a.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-card hover:-translate-y-1 hover:shadow-card-hover"
              >
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.profiles.avatar_url}
                    alt={a.profiles?.full_name}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-forest-light via-gold-light to-brand-light font-heading text-3xl font-extrabold text-forest">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="p-5">
                  {a.is_verified && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-forest-light px-2.5 py-0.5 text-[11px] font-bold text-forest">
                      ✓ Vérifié
                    </span>
                  )}
                  <p className="font-heading text-base font-bold text-ink">{a.profiles?.full_name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {a.trade} · {a.profiles?.city || "Côte d'Ivoire"}
                  </p>
                  <p className="mt-3 text-sm font-bold text-brand group-hover:underline">Voir le profil →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="bg-gradient-to-b from-white to-gold-light/40 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Comment ça marche ?</p>
          <h2 className="font-heading mt-1 text-3xl font-extrabold text-ink">
            Vous gérez vos travaux, nous gérons la sécurité
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 rounded-2xl bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-gold font-heading text-sm font-extrabold text-white">
                  {step.n}
                </div>
                <div>
                  <p className="font-heading font-bold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBanner />
    </div>
  );
}
