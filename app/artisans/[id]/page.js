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
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <PhotoCarousel photos={photos} />
      </div>

      {/* Identité */}
      <div className="mt-6 flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6">
        {artisan.profiles?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisan.profiles.avatar_url}
            alt={artisan.profiles?.full_name}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-50 font-heading text-xl font-bold text-gray-300">
            {artisan.profiles?.full_name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{artisan.profiles?.full_name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {artisan.trade} · {artisan.profiles?.city || "Côte d'Ivoire"}
          </p>
          {artisan.is_verified && (
            <span className="mt-2 inline-block rounded bg-forest px-2 py-0.5 text-xs font-bold text-white">
              Profil vérifié
            </span>
          )}
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="font-heading text-2xl font-bold text-ink">{artisan.years_experience || 0}</p>
          <p className="text-xs text-gray-500">années d'expérience</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="font-heading text-2xl font-bold text-ink">{artisan.projects_completed || 0}</p>
          <p className="text-xs text-gray-500">projets réalisés</p>
        </div>
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4 text-center sm:col-span-1">
          <p className="font-heading text-sm font-bold text-ink">
            {artisan.mobility_scope === "all" ? "Toute la CI" : "Zones précises"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {artisan.mobility_scope === "all"
              ? "Disponible partout"
              : artisan.mobility_cities?.join(", ") || "Non précisé"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
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
                <span key={s} className="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
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
          className="rounded-md bg-brand px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-dark"
        >
          Rendez-vous visio
        </Link>
        <Link
          href={`/messages/new?artisan=${artisan.id}`}
          className="rounded-md border border-gray-300 px-4 py-3 text-center text-sm font-bold text-ink hover:bg-gray-50"
        >
          Message
        </Link>
        <Link
          href={`/projects/new?artisan=${artisan.id}`}
          className="rounded-md bg-forest px-4 py-3 text-center text-sm font-bold text-white hover:bg-forest-dark"
        >
          Démarrer un projet
        </Link>
      </div>

      {/* Avis */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Avis</p>
        <div className="mt-3">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
