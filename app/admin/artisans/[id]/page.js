import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addAdminNote, toggleVerified } from "../../actions";
import Link from "next/link";

export default async function AdminArtisanDetailPage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!myProfile?.is_admin) redirect("/dashboard");

  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select("*, profiles ( * )")
    .eq("id", id)
    .single();

  if (!artisan) return <p className="px-4 py-12">Artisan introuvable.</p>;

  let idDocumentSignedUrl = null;
  if (artisan.profiles?.id_document_url) {
    const { data } = await supabase.storage
      .from("id-documents")
      .createSignedUrl(artisan.profiles.id_document_url, 3600);
    idDocumentSignedUrl = data?.signedUrl || null;
  }

  const { data: notes } = await supabase
    .from("artisan_admin_notes")
    .select("*, created_by_profile:created_by ( full_name )")
    .eq("artisan_id", id)
    .order("created_at", { ascending: false });

  const { data: photos } = await supabase
    .from("artisan_photos")
    .select("*")
    .eq("artisan_id", id)
    .order("created_at", { ascending: true });

  const p = artisan.profiles;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin/artisans" className="text-sm text-brand hover:underline">
        ← Tous les artisans
      </Link>

      <div className="mt-4 flex items-center gap-4">
        {p?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 font-heading text-lg font-bold text-gray-300">
            {p?.full_name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{p?.full_name}</h1>
          <p className="text-sm text-gray-500">{artisan.trade} · {p?.city}</p>
        </div>
      </div>

      <form action={toggleVerified} className="mt-4">
        <input type="hidden" name="artisanId" value={artisan.id} />
        <input type="hidden" name="isVerified" value={String(artisan.is_verified)} />
        <button
          type="submit"
          className={`rounded-md px-4 py-2 text-sm font-bold ${
            artisan.is_verified ? "bg-gray-100 text-gray-600" : "bg-forest text-white"
          }`}
        >
          {artisan.is_verified ? "Retirer la vérification" : "Marquer comme vérifié"}
        </button>
      </form>

      {/* Informations privées */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Informations privées</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-400">Téléphone</dt><dd>{p?.phone || "—"}</dd></div>
          <div><dt className="text-gray-400">Ville</dt><dd>{p?.city || "—"}</dd></div>
          <div><dt className="text-gray-400">Contact d'un proche</dt><dd>{p?.emergency_contact_name || "—"}</dd></div>
          <div><dt className="text-gray-400">Téléphone du proche</dt><dd>{p?.emergency_contact_phone || "—"}</dd></div>
          <div><dt className="text-gray-400">Mobile Money</dt><dd>{artisan.mobile_money_operator} {artisan.mobile_money_number || "—"}</dd></div>
          <div><dt className="text-gray-400">Inscrit le</dt><dd>{p?.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}</dd></div>
        </dl>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <dt className="text-xs text-gray-400">Position GPS (adresse fixe)</dt>
          {p?.home_latitude && p?.home_longitude ? (
            <dd className="mt-1 text-sm">
              Capturée le {p.home_location_captured_at ? new Date(p.home_location_captured_at).toLocaleDateString("fr-FR") : "—"} —{" "}
              <a
                href={`https://www.google.com/maps?q=${p.home_latitude},${p.home_longitude}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand hover:underline"
              >
                voir sur la carte
              </a>
            </dd>
          ) : (
            <dd className="mt-1 text-sm text-red-600">Non renseignée</dd>
          )}
        </div>
      </div>

      {/* Pièce d'identité */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Pièce d'identité</p>
        {idDocumentSignedUrl ? (
          <div className="mt-3">
            <p className="text-sm">
              {p.id_document_type} — n° {p.id_document_number}
            </p>
            <a
              href={idDocumentSignedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
            >
              Voir le document
            </a>
          </div>
        ) : (
          <p className="mt-2 text-sm text-red-600">Aucune pièce d'identité envoyée</p>
        )}
      </div>

      {/* Profil professionnel */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profil professionnel</p>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div><dt className="text-gray-400">Description</dt><dd>{artisan.bio || "—"}</dd></div>
          <div><dt className="text-gray-400">Expérience</dt><dd>{artisan.years_experience || 0} ans</dd></div>
          <div><dt className="text-gray-400">Tarification</dt><dd>{artisan.pricing_info || "—"}</dd></div>
          <div><dt className="text-gray-400">Services</dt><dd>{(artisan.services || []).join(", ") || "—"}</dd></div>
          <div><dt className="text-gray-400">Mobilité</dt><dd>{artisan.mobility_scope === "all" ? "Toute la CI" : (artisan.mobility_cities || []).join(", ")}</dd></div>
        </dl>
      </div>

      {/* Photos de réalisations */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Photos de réalisations ({photos?.length || 0})
        </p>
        {photos?.length === 0 || !photos ? (
          <p className="mt-2 text-sm text-gray-500">Aucune photo envoyée.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((ph) => (
              <a key={ph.id} href={ph.photo_url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.photo_url} alt={ph.caption || ""} className="h-24 w-full rounded-lg object-cover" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Remarques admin */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Remarques (internes)</p>
        <div className="mt-3 flex flex-col gap-2">
          {notes?.length === 0 && <p className="text-sm text-gray-500">Aucune remarque pour le moment.</p>}
          {notes?.map((n) => (
            <div key={n.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <p>{n.note}</p>
              <p className="mt-1 text-xs text-gray-400">
                {n.created_by_profile?.full_name} — {new Date(n.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
        <form action={addAdminNote} className="mt-3 flex gap-2">
          <input type="hidden" name="artisanId" value={artisan.id} />
          <input
            name="note"
            required
            placeholder="Ajouter une remarque..."
            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
