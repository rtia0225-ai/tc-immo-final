// Cette fonction répare le cas où le profil n'a pas pu être créé au moment
// de l'inscription (ex: confirmation d'email requise, donc pas encore de
// session active pour passer les règles de sécurité de la base de données).
// On garde le nom/rôle/métier dans les métadonnées du compte à l'inscription,
// puis on les utilise ici pour créer le profil dès que l'utilisateur est
// vraiment connecté.

export async function ensureProfile(supabase, user) {
  if (!user) return;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) return; // le profil existe déjà, rien à faire

  const fullName = user.user_metadata?.full_name || "Utilisateur";
  const role = user.user_metadata?.role || "client";
  const trade = user.user_metadata?.trade;

  await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    role,
  });

  if (role === "artisan") {
    await supabase.from("artisan_profiles").insert({
      id: user.id,
      trade: trade || "Non spécifié",
    });
  }
}
