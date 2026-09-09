"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Enregistre la position GPS capturée une seule fois (comme un partage de
// position WhatsApp) — devient l'adresse fixe de l'artisan. Appelée
// directement depuis le bouton "Partager ma position", pas via un
// formulaire classique.
export async function saveHomeLocation(latitude, longitude) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const { error } = await supabase
    .from("profiles")
    .update({
      home_latitude: latitude,
      home_longitude: longitude,
      home_location_captured_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  return { success: true };
}

// Met à jour à la fois les infos personnelles (privées) et le profil
// professionnel public de l'artisan, en une seule soumission.
export async function updateArtisanProfile(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // --- Informations personnelles (jamais visibles du client) ---
  const fullName = formData.get("fullName");
  const phone = formData.get("phone");
  const emergencyContactName = formData.get("emergencyContactName");
  const emergencyContactPhone = formData.get("emergencyContactPhone");
  const city = formData.get("city");

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      city,
    })
    .eq("id", user.id);

  // --- Profil professionnel public ---
  const trade = formData.get("trade");
  const services = formData.getAll("services"); // plusieurs cases cochées
  const bio = formData.get("bio");
  const yearsExperience = formData.get("yearsExperience");
  const pricingInfo = formData.get("pricingInfo");
  const mobilityScope = formData.get("mobilityScope"); // 'all' ou 'selected'
  const mobilityCities = formData.getAll("mobilityCities");

  await supabase
    .from("artisan_profiles")
    .update({
      trade,
      services,
      bio,
      years_experience: yearsExperience ? Number(yearsExperience) : 0,
      pricing_info: pricingInfo,
      mobility_scope: mobilityScope,
      mobility_cities: mobilityScope === "selected" ? mobilityCities : [],
    })
    .eq("id", user.id);

  redirect("/dashboard/profile?success=1");
}

// Photo de profil : upload direct depuis l'appareil (téléphone/ordinateur),
// stockée dans le bucket "avatars", un seul fichier par personne (remplacé
// à chaque nouvel envoi).
export async function uploadAvatar(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const file = formData.get("avatar");
  if (!file || typeof file === "string" || file.size === 0) {
    redirect("/dashboard/profile?error=Aucune+photo+sélectionnée");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq("id", user.id);

  redirect("/dashboard/profile?success=1");
}

// Photo de réalisation : upload direct depuis l'appareil, stockée dans le
// bucket "artisan-photos". Chaque photo est indépendante (pas de remplacement).
// Limite : 5 photos maximum par artisan, imposée ici côté serveur.
const MAX_REALISATION_PHOTOS = 5;

export async function addArtisanPhoto(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const files = formData.getAll("photo").filter((f) => typeof f !== "string" && f.size > 0);
  const caption = formData.get("caption");

  if (files.length === 0) {
    redirect("/dashboard/profile?error=Aucune+photo+sélectionnée");
  }

  const { count: existingCount } = await supabase
    .from("artisan_photos")
    .select("id", { count: "exact", head: true })
    .eq("artisan_id", user.id);

  const remainingSlots = MAX_REALISATION_PHOTOS - (existingCount || 0);

  if (remainingSlots <= 0) {
    redirect(
      `/dashboard/profile?error=${encodeURIComponent(
        `Tu as déjà ${MAX_REALISATION_PHOTOS} photos (le maximum). Supprime-en une pour en ajouter une nouvelle.`
      )}`
    );
  }

  const filesToUpload = files.slice(0, remainingSlots);
  const skipped = files.length - filesToUpload.length;

  for (const file of filesToUpload) {
    const ext = file.name.split(".").pop() || "jpg";
    // Un identifiant unique par fichier pour éviter que plusieurs photos
    // envoyées à la même seconde ne s'écrasent entre elles.
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("artisan-photos")
      .upload(path, arrayBuffer, { contentType: file.type });

    if (uploadError) {
      redirect(`/dashboard/profile?error=${encodeURIComponent(uploadError.message)}`);
    }

    const { data: publicUrlData } = supabase.storage.from("artisan-photos").getPublicUrl(path);

    await supabase.from("artisan_photos").insert({
      artisan_id: user.id,
      photo_url: publicUrlData.publicUrl,
      caption: caption?.trim() || null,
    });
  }

  if (skipped > 0) {
    redirect(
      `/dashboard/profile?error=${encodeURIComponent(
        `${skipped} photo(s) non ajoutée(s) : maximum ${MAX_REALISATION_PHOTOS} atteint.`
      )}`
    );
  }

  redirect("/dashboard/profile?success=1");
}

export async function deleteArtisanPhoto(formData) {
  const supabase = createClient();
  const photoId = formData.get("photoId");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("artisan_photos")
    .delete()
    .eq("id", photoId)
    .eq("artisan_id", user.id);

  redirect("/dashboard/profile?success=1");
}
