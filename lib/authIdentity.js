// Supabase Auth exige un email pour s'authentifier, mais beaucoup
// d'artisans n'en ont pas. On accepte donc un email OU un numéro de
// téléphone comme identifiant : si ce n'est pas un email, on le convertit
// en un email technique interne (jamais envoyé, jamais affiché), tout en
// gardant le vrai numéro de côté pour l'utiliser comme contact réel.
export function toAuthIdentity(rawIdentifier) {
  const identifier = (rawIdentifier || "").trim();

  if (identifier.includes("@")) {
    return { email: identifier, phone: null };
  }

  const digits = identifier.replace(/[^\d]/g, "");
  return { email: `${digits}@tc-immo.local`, phone: identifier };
}
