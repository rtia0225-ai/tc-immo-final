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
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-sm font-medium text-clay">Projets réalisés</p>
      <PhotoCarousel photos={photos} />

      {/* Identité */}
      <div className="mt-8 flex items-start gap-4 border-b border-line pb-8">
        {artisan.profiles?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisan.profiles.avatar_url}
            alt={artisan.profiles?.full_name}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line font-heading text-lg text-ink/40">
            {artisan.profiles?.full_name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-medium text-ink">{artisan.profiles?.full_name}</h1>
          <p className="mt-0.5 text-sm text-ink/60">
            {artisan.trade} · {artisan.profiles?.city || "Côte d'Ivoire"}
          </p>
          {artisan.is_verified && (
            <p className="mt-1 text-xs font-medium text-forest">Profil vérifié</p>
          )}
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 gap-6 border-b border-line py-6 sm:grid-cols-3">
        <div>
          <p className="text-xs text-ink/40">Expérience</p>
          <p className="font-heading text-lg text-ink">{artisan.years_experience || 0} ans</p>
        </div>
        <div>
          <p className="text-xs text-ink/40">Projets réalisés</p>
          <p className="font-heading text-lg text-ink">{artisan.projects_completed || 0}</p>
        </div>
        <div>
          <p className="text-xs text-ink/40">Zone d'intervention</p>
          <p className="mt-0.5 text-sm text-ink">
            {artisan.mobility_scope === "all"
              ? "Toute la Côte d'Ivoire"
              : artisan.mobility_cities && artisan.mobility_cities.length > 0
                ? artisan.mobility_cities.join(", ")
                : "Non précisée"}
          </p>
        </div>
      </div>

      <div className="border-b border-line py-6">
        {artisan.availability_days && artisan.availability_days.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-ink/40">Disponibilités</p>
            <p className="mt-0.5 text-sm text-ink">{artisan.availability_days.join(", ")}</p>
          </div>
        )}

        {artisan.pricing_info && (
          <div className="mb-5">
            <p className="text-xs text-ink/40">Tarification</p>
            <p className="mt-0.5 text-sm text-ink">{artisan.pricing_info}</p>
          </div>
        )}

        {artisan.services && artisan.services.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-ink/40">Services proposés</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {artisan.services.map((s) => (
                <span key={s} className="border border-line px-2 py-0.5 text-xs text-ink/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {artisan.bio && (
          <div>
            <p className="text-xs text-ink/40">Pourquoi moi</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{artisan.bio}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid gap-2 py-6 sm:grid-cols-3">
        <Link
          href={`/appointments/new?artisan=${artisan.id}`}
          className="bg-ink px-4 py-3 text-center text-sm font-medium text-stone hover:bg-black"
        >
          Rendez-vous visio
        </Link>
        <Link
          href={`/messages/new?artisan=${artisan.id}`}
          className="border border-ink px-4 py-3 text-center text-sm font-medium text-ink hover:bg-ink hover:text-stone"
        >
          Message
        </Link>
        <Link
          href={`/projects/new?artisan=${artisan.id}`}
          className="bg-forest px-4 py-3 text-center text-sm font-medium text-white hover:bg-forest-dark"
        >
          Démarrer un projet
        </Link>
      </div>

      {/* Avis */}
      <div className="border-t border-line pt-6">
        <p className="text-xs text-ink/40">Avis</p>
        <div className="mt-3">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
