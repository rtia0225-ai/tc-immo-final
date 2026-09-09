import { createClient } from "@/lib/supabase/server";
import ReviewList from "@/components/ReviewList";
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
    .eq("artisan_id", id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, profiles ( full_name )")
    .eq("artisan_id", id)
    .order("created_at", { ascending: false });

  if (!artisan) {
    return <p className="px-4 py-12">Artisan introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Galerie de réalisations */}
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Projets réalisés</p>
      {photos && photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.photo_url}
              alt={p.caption || "Réalisation"}
              className="h-28 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex h-36 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          Aucune photo pour le moment
        </div>
      )}

      {/* Identité et infos clés */}
      <div className="mt-6">
        <h1 className="font-heading text-2xl font-bold">{artisan.profiles?.full_name}</h1>
        <p className="text-sm text-brand">{artisan.trade}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          📍 {artisan.profiles?.city || "Côte d'Ivoire"}
        </p>

        {/* Mobilité */}
        <p className="mt-2 text-sm text-gray-600">
          🚗 {artisan.mobility_scope === "all"
            ? "Disponible partout en Côte d'Ivoire"
            : artisan.mobility_cities && artisan.mobility_cities.length > 0
              ? `Intervient à : ${artisan.mobility_cities.join(", ")}`
              : "Zone d'intervention non précisée"}
        </p>

        {/* Disponibilités */}
        {artisan.availability_days && artisan.availability_days.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            🗓️ Disponible : {artisan.availability_days.join(", ")}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-gray-400">Expérience</p>
            <p className="font-semibold">{artisan.years_experience || 0} années</p>
          </div>
          <div>
            <p className="text-gray-400">Projets réalisés</p>
            <p className="font-semibold">{artisan.projects_completed || 0}</p>
          </div>
        </div>

        {/* Tarification */}
        {artisan.pricing_info && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700">Tarification</p>
            <p className="mt-1 text-sm text-gray-600">{artisan.pricing_info}</p>
          </div>
        )}

        {/* Services compris */}
        {artisan.services && artisan.services.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700">Services proposés</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {artisan.services.map((s) => (
                <span key={s} className="rounded-full bg-forest-light px-3 py-1 text-xs font-medium text-forest">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pourquoi moi */}
        {artisan.bio && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700">Pourquoi moi</p>
            <p className="mt-1 text-sm text-gray-600">{artisan.bio}</p>
          </div>
        )}
      </div>

      {/* Actions : toujours visibles, redirection vers connexion si besoin */}
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <Link
          href={`/appointments/new?artisan=${artisan.id}`}
          className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Prendre un RDV visio
        </Link>
        <Link
          href={`/messages/new?artisan=${artisan.id}`}
          className="rounded-lg border border-brand px-4 py-2 text-center text-sm font-semibold text-brand hover:bg-brand-light"
        >
          Discuter par message
        </Link>
        <Link
          href={`/projects/new?artisan=${artisan.id}`}
          className="rounded-lg bg-forest px-4 py-2 text-center text-sm font-semibold text-white hover:bg-forest-dark"
        >
          Démarrer un projet
        </Link>
      </div>

      {/* Avis */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700">Avis</p>
        <div className="mt-3">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
