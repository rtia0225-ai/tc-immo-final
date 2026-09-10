import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateArtisanProfile, addArtisanPhoto, deleteArtisanPhoto, uploadAvatar } from "./actions";
import { uploadIdDocument } from "@/lib/idDocumentActions";
import { CI_CITIES, CONSTRUCTION_SERVICES } from "@/lib/constants";
import ShareLocationButton from "@/components/ShareLocationButton";

export default async function ArtisanProfileEditPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artisan") {
    redirect("/dashboard");
  }

  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: photos } = await supabase
    .from("artisan_photos")
    .select("*")
    .eq("artisan_id", user.id)
    .order("created_at", { ascending: false });

  const selectedServices = artisan?.services || [];
  const selectedMobilityCities = artisan?.mobility_cities || [];

  // URL temporaire (1h) pour afficher la pièce d'identité déjà envoyée —
  // le bucket est privé, jamais d'URL publique permanente.
  let idDocumentSignedUrl = null;
  if (profile?.id_document_url) {
    const { data } = await supabase.storage
      .from("id-documents")
      .createSignedUrl(profile.id_document_url, 3600);
    idDocumentSignedUrl = data?.signedUrl || null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Modifier mon profil</h1>

      {searchParams?.success && (
        <p className="mt-4 rounded-lg bg-forest-light p-3 text-sm text-forest">
          Profil mis à jour avec succès.
        </p>
      )}
      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      {/* Photo de profil */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold text-brand">Photo de profil</h2>
        <div className="mt-3 flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="Photo de profil"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 font-heading text-xl font-bold text-gray-400">
              {profile?.full_name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <form action={uploadAvatar} className="flex items-center gap-2">
            <input
              type="file"
              name="avatar"
              accept="image/*"
              required
              className="text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
            >
              Envoyer
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Choisis une photo depuis ton téléphone ou ton ordinateur — elle sera visible par les clients.
        </p>
      </section>

      {/* Pièce d'identité, en dehors du formulaire principal (upload indépendant) */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-brand">Pièce d'identité</h2>
        {idDocumentSignedUrl && (
          <p className="mt-2 text-sm text-forest">
            ✓ Document déjà envoyé —{" "}
            <a href={idDocumentSignedUrl} target="_blank" rel="noreferrer" className="underline">
              voir le fichier
            </a>
          </p>
        )}
        <form action={uploadIdDocument} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="returnTo" value="/dashboard/profile" />
          <input
            type="file"
            name="idDocument"
            accept="image/*,.pdf"
            required
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
          >
            Envoyer
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Carte nationale d'identité, passeport ou équivalent. Jamais visible par les clients.
        </p>
      </section>

      <form action={updateArtisanProfile} className="mt-8 flex flex-col gap-8">
        {/* ------------------------------------------------------ */}
        <section>
          <h2 className="font-heading text-lg font-bold text-brand">Informations personnelles</h2>
          <p className="mb-4 text-xs text-gray-500">
            Le téléphone et le contact d'urgence ne sont jamais visibles par les clients — utilisés uniquement pour la vérification de ton profil.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nom complet</label>
              <input
                name="fullName"
                defaultValue={profile?.full_name || ""}
                required
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone (privé)</label>
              <input
                name="phone"
                defaultValue={profile?.phone || ""}
                placeholder="ex: +225 07 00 00 00 00"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Contact d'un proche (privé)</label>
                <input
                  name="emergencyContactName"
                  defaultValue={profile?.emergency_contact_name || ""}
                  placeholder="Nom complet"
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Téléphone du proche (privé)</label>
                <input
                  name="emergencyContactPhone"
                  defaultValue={profile?.emergency_contact_phone || ""}
                  placeholder="Téléphone"
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ville de base</label>
              <select
                name="city"
                defaultValue={profile?.city || ""}
                required
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="" disabled>Choisir une ville</option>
                {CI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="mb-2 block text-sm font-medium">Adresse exacte (position GPS, privée)</label>
              <ShareLocationButton
                latitude={profile?.home_latitude}
                longitude={profile?.home_longitude}
                capturedAt={profile?.home_location_captured_at}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        <section>
          <h2 className="font-heading text-lg font-bold text-brand">Profil visible par les clients</h2>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Métier principal</label>
              <select
                name="trade"
                defaultValue={artisan?.trade || ""}
                required
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="" disabled>Choisir un métier</option>
                {CONSTRUCTION_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Services proposés (plusieurs choix possibles)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONSTRUCTION_SERVICES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="services"
                      value={s}
                      defaultChecked={selectedServices.includes(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Mobilité</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="mobilityScope"
                    value="all"
                    defaultChecked={artisan?.mobility_scope === "all"}
                  />
                  Disponible partout en Côte d'Ivoire
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="mobilityScope"
                    value="selected"
                    defaultChecked={artisan?.mobility_scope !== "all"}
                  />
                  Villes spécifiques uniquement
                </label>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CI_CITIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      name="mobilityCities"
                      value={c}
                      defaultChecked={selectedMobilityCities.includes(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description (visible sur ton profil)</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={artisan?.bio || ""}
                placeholder="Qui es-tu, ton expérience, ce qui te distingue..."
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Années d'expérience</label>
              <input
                type="number"
                name="yearsExperience"
                min="0"
                defaultValue={artisan?.years_experience || 0}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tarification</label>
              <textarea
                name="pricingInfo"
                rows={2}
                defaultValue={artisan?.pricing_info || ""}
                placeholder="ex: 25 000 XOF / jour, ou sur devis par contrat"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-lg bg-brand py-3 font-heading font-bold text-white hover:bg-brand-dark"
        >
          Enregistrer mon profil
        </button>
      </form>

      {/* ------------------------------------------------------ */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-brand">Photos de réalisations</h2>
          <span className="text-xs text-gray-500">{photos?.length || 0}/5</span>
        </div>

        {photos && photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photo_url} alt={p.caption || ""} className="h-24 w-full rounded-lg object-cover" />
                <form action={deleteArtisanPhoto} className="absolute right-1 top-1">
                  <input type="hidden" name="photoId" value={p.id} />
                  <button type="submit" className="rounded-full bg-black/60 px-1.5 text-xs text-white">✕</button>
                </form>
              </div>
            ))}
          </div>
        )}

        {(photos?.length || 0) >= 5 ? (
          <p className="mt-4 text-xs text-gray-500">
            Maximum de 5 photos atteint. Supprime-en une pour en ajouter une nouvelle.
          </p>
        ) : (
          <>
            <form action={addArtisanPhoto} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="file"
                name="photo"
                accept="image/*"
                multiple
                required
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
              />
              <input
                name="caption"
                placeholder="Légende (optionnel, appliquée à toutes)"
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
              />
              <button type="submit" className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark">
                Ajouter
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              Choisis une ou plusieurs photos depuis ton téléphone ou ton ordinateur (maintiens Ctrl/Cmd pour en sélectionner plusieurs) — {5 - (photos?.length || 0)} emplacement(s) restant(s).
            </p>
          </>
        )}
      </section>
    </div>
  );
}
