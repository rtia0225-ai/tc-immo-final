import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrustBanner from "@/components/TrustBanner";
import { CI_CITIES, CONSTRUCTION_SERVICES } from "@/lib/constants";

const STEPS = [
  {
    n: 1,
    title: "Choisissez votre prestataire",
    text: "Lancez votre recherche et consultez les profils vérifiés, les avis, les réalisations. Prenez rendez-vous en visio directement via la plateforme avec ceux que vous avez sélectionnés puis choisissez-en un.",
  },
  {
    n: 2,
    title: "Sécurisez vos travaux",
    text: "Une fois votre prestataire choisi, recevez son devis et signez le contrat tripartite avec la planification des travaux.",
  },
  {
    n: 3,
    title: "Payez en sécurité et à votre rythme",
    text: "Une fois votre contrat signé, payez à votre rythme (avec l'accord de l'artisan). C'est vous qui décidez du financement de vos travaux.",
  },
  {
    n: 4,
    title: "Suivez vos travaux",
    text: "Suivez l'état d'avancement de vos travaux n'importe où en vous connectant à votre espace.",
  },
];

export default async function HomePage() {
  const supabase = createClient();

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select(
      `id, trade, is_verified, profiles ( full_name, city )`
    )
    .order("is_verified", { ascending: false })
    .limit(8);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center px-4 py-24 text-center text-white"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,20,15,0.55), rgba(9,20,15,0.8)), linear-gradient(120deg, #7a4a26, #c07a3c 45%, #e0a35c 70%, #3a2a1a)",
        }}
      >
        <h1 className="font-heading max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Construire en Côte d'Ivoire, en toute sécurité, depuis la France
        </h1>
        <p className="mt-4 max-w-xl text-white/90">
          Soyez maître de vos travaux : trouvez votre artisan, suivez vos travaux en temps réel, payez à votre rythme.
        </p>

        {/* Search card */}
        <form
          action="/artisans"
          className="mt-10 w-full max-w-3xl rounded-2xl bg-white p-5 text-left shadow-xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Artisans</label>
              <select name="trade" defaultValue="" className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-800">
                <option value="">Tous les métiers</option>
                {CONSTRUCTION_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type de maison</label>
              <input
                name="house_type"
                placeholder="Ex : Villa, duplex..."
                className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ville</label>
              <select name="city" defaultValue="" className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-800">
                <option value="">Toutes les villes</option>
                {CI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recommandation</label>
              <input
                name="recommendation"
                placeholder="Ex : 3 recommandations..."
                className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-semibold text-white hover:bg-brand-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Trouver
          </button>
        </form>
      </section>

      {/* Artisans vérifiés */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Artisans vérifiés et suivis</p>
        <h2 className="font-heading mt-1 text-2xl font-bold">Les meilleurs professionnels de confiance</h2>

        {!artisans || artisans.length === 0 ? (
          <p className="mt-6 text-gray-500">Aucun artisan pour le moment.</p>
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/artisans/${a.id}`}
                className="w-64 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-forest-light to-brand-light text-4xl">
                  🛠️
                </div>
                <div className="p-4">
                  {a.is_verified && (
                    <span className="mb-2 inline-block rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                      {a.trade}
                    </span>
                  )}
                  <p className="font-heading text-sm font-bold">{a.profiles?.full_name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    📍 {a.profiles?.city || "Côte d'Ivoire"}
                  </p>
                  <p className="mt-3 text-xs font-medium text-forest">Voir le profil →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Comment ça marche ?</p>
        <h2 className="font-heading mt-1 text-2xl font-bold">Vous gérez vos travaux, nous gérons la sécurité</h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-sm font-bold text-white">
                {step.n}
              </div>
              <div>
                <p className="font-heading font-bold">{step.title}</p>
                <p className="mt-1 text-sm text-gray-500">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TrustBanner />
    </div>
  );
}
