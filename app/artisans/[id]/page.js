import { createClient } from "@/lib/supabase/server";
import ReviewList from "@/components/ReviewList";
import PhotoCarousel from "@/components/PhotoCarousel";
import Link from "next/link";

export default async function ArtisanProfilePage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select(
      `id, trade, bio, years_experience, is_verified, pricing_info,
       services, projects_completed, mobility_scope, mobility_cities,
       availability_days,
       profiles ( full_name, city, avatar_url )`
    )
    .eq("id", id)
    .single();

  const { data: photos } = await supabase
    .from("artisan_photos")
    .select("id, photo_url, caption")
    .eq("artisan_id", id)
    .order("created_at", { ascending: true });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, profiles ( full_name )")
    .eq("artisan_id", id)
    .order("created_at", { ascending: false });

  if (!artisan) {
    return <p className="px-4 py-12">Artisan introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl shadow-card">
        <PhotoCarousel photos={photos} />
      </div>

      {/* Identité */}
      <div className="mt-6 flex items-start gap-4 rounded-2xl bg-white p-6 shadow-card">
        {artisan.profiles?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisan.profiles.avatar_url}
            alt={artisan.profiles?.full_name}
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-forest-light"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-light to-gold-light font-heading text-xl font-bold text-forest">
            {artisan.profiles?.full_name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-ink">{artisan.profiles?.full_name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {artisan.trade} · {artisan.profiles?.city || "Côte d'Ivoire"}
          </p>
          {artisan.is_verified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-forest-light px-2.5 py-0.5 text-xs font-bold text-forest">
              ✓ Profil vérifié
            </span>
          )}
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
          <p className="font-heading text-2xl font-extrabold text-brand">{artisan.years_experience || 0}</p>
          <p className="text-xs text-gray-500">années d'expérience</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
          <p className="font-heading text-2xl font-extrabold text-forest">{artisan.projects_completed || 0}</p>
          <p className="text-xs text-gray-500">projets réalisés</p>
        </div>
        <div className="col-span-2 rounded-2xl bg-white p-4 text-center shadow-card sm:col-span-1">
          <p className="font-heading text-sm font-bold text-azure">
            {artisan.mobility_scope === "all" ? "Toute la CI" : "Zones précises"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {artisan.mobility_scope === "all"
              ? "Disponible partout"
              : artisan.mobility_cities?.join(", ") || "Non précisé"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        {artisan.availability_days && artisan.availability_days.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Disponibilités</p>
            <p className="mt-1 text-sm text-ink">{artisan.availability_days.join(", ")}</p>
          </div>
        )}

        {artisan.pricing_info && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Tarification</p>
            <p className="mt-1 text-sm text-ink">{artisan.pricing_info}</p>
          </div>
        )}

        {artisan.services && artisan.services.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Services proposés</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {artisan.services.map((s) => (
                <span key={s} className="rounded-full bg-azure-light px-3 py-1 text-xs font-medium text-azure-dark">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {artisan.bio && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Pourquoi moi</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{artisan.bio}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href={`/appointments/new?artisan=${artisan.id}`}
          className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-bold text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          Rendez-vous visio
        </Link>
        <Link
          href={`/messages/new?artisan=${artisan.id}`}
          className="rounded-xl bg-azure px-4 py-3 text-center text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-azure-dark"
        >
          Message
        </Link>
        <Link
          href={`/projects/new?artisan=${artisan.id}`}
          className="rounded-xl bg-forest px-4 py-3 text-center text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-forest-dark"
        >
          Démarrer un projet
        </Link>
      </div>

      {/* Avis */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Avis</p>
        <div className="mt-3">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
