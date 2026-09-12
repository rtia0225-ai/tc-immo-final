import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrustBanner from "@/components/TrustBanner";
import ConstructionWizard from "@/components/ConstructionWizard";
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
    .eq("is_suspended", false)
    .order("is_verified", { ascending: false })
    .limit(6);

  return (
    <div>
      <ConstructionWizard />

      {/* Hero : vraie photo, texte compact, bandeau de recherche qui chevauche */}
      <section className="relative">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-elephants.jpg"
            alt="Savane en Côte d'Ivoire"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
            <h1 className="font-heading max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Construisez chez vous, en toute sécurité, depuis n'importe où
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
              TC-Immo connecte la diaspora à des artisans vérifiés en Côte d'Ivoire.
            </p>
          </div>
        </div>

        {/* Bandeau de recherche dense, pratique, qui chevauche le bas du hero */}
        <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-4">
          <form
            action="/artisans"
            className="grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 shadow-lg sm:grid-cols-5"
          >
            <div className="bg-white p-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Métier</label>
              <select name="trade" defaultValue="" className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-ink focus:outline-none">
                <option value="">Tous</option>
                {CONSTRUCTION_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="bg-white p-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Type de bien</label>
              <select name="house_type" defaultValue="" className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-ink focus:outline-none">
                <option value="">Tous</option>
                {HOUSE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="bg-white p-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ville</label>
              <select name="city" defaultValue="" className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-ink focus:outline-none">
                <option value="">Toutes</option>
                {CI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="bg-white p-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Recommandation</label>
              <select name="recommendation" defaultValue="" className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-ink focus:outline-none">
                <option value="">Toute la liste</option>
                {RECOMMENDATION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-brand text-sm font-bold text-white hover:bg-brand-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Artisans vérifiés */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl font-bold text-ink">Artisans vérifiés</h2>
          <Link href="/artisans" className="text-sm font-semibold text-brand hover:underline">
            Voir tous les profils
          </Link>
        </div>

        {!artisans || artisans.length === 0 ? (
          <p className="mt-6 text-gray-500">Aucun artisan pour le moment.</p>
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/artisans/${a.id}`}
                className="group w-60 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md"
              >
                {a.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${a.profiles.avatar_url}?v=${Date.now()}`}
                    alt={a.profiles?.full_name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gray-50 font-heading text-2xl font-bold text-gray-300">
                    {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-sm font-bold text-ink">{a.profiles?.full_name}</p>
                    {a.is_verified && (
                      <span className="rounded bg-forest px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {a.trade} · {a.profiles?.city || "Côte d'Ivoire"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl font-bold text-ink">Comment ça marche</h2>
          <p className="mt-1 text-sm text-gray-500">Vous gérez vos travaux, nous gérons la sécurité.</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-sm font-bold text-white">
                  {step.n}
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.text}</p>
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
