"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/ensureProfile";
import { toAuthIdentity } from "@/lib/authIdentity";

export async function signup(formData) {
  const supabase = createClient();

  const identifier = formData.get("identifier"); // email OU numéro de téléphone
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  const role = formData.get("role"); // 'client' ou 'artisan'
  const city = formData.get("city");
  const redirectTo = formData.get("redirect"); // page à retrouver après connexion

  // Champs supplémentaires, uniquement utilisés si artisan
  const trade = formData.get("trade");
  const bio = formData.get("bio");
  const yearsExperience = formData.get("yearsExperience");
  const pricingInfo = formData.get("pricingInfo");
  const mobilityScope = formData.get("mobilityScope");
  const mobilityCities = formData.getAll("mobilityCities");
  const services = formData.getAll("services");
  const emergencyContactName = formData.get("emergencyContactName");
  const emergencyContactPhone = formData.get("emergencyContactPhone");
  const mobileMoneyOperator = formData.get("mobileMoneyOperator");
  const mobileMoneyNumber = formData.get("mobileMoneyNumber");

  const { email, phone } = toAuthIdentity(identifier);

  // Tout part dans les métadonnées du compte : le déclencheur en base de
  // données crée le profil complet (client ou artisan) automatiquement,
  // même si la confirmation d'email retarde la création d'une session.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone,
        city,
        trade,
        bio,
        years_experience: yearsExperience,
        pricing_info: pricingInfo,
        mobility_scope: mobilityScope,
        mobility_cities: mobilityCities,
        services,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        mobile_money_operator: mobileMoneyOperator,
        mobile_money_number: mobileMoneyNumber,
      },
    },
  });

  if (error) {
    const url = redirectTo
      ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(error.message)}`
      : `/auth/signup?error=${encodeURIComponent(error.message)}`;
    return redirect(url);
  }

  const userId = data.user?.id;
  if (userId) {
    // Tentative immédiate (fonctionne si aucune confirmation d'email
    // n'est requise). Si ça échoue silencieusement, le déclencheur en
    // base de données (ou ensureProfile() à la connexion) rattrape ça.
    await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      role,
      phone,
      city,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
    });

    if (role === "artisan") {
      await supabase.from("artisan_profiles").insert({
        id: userId,
        trade: trade || "Non spécifié",
        bio,
        years_experience: yearsExperience ? Number(yearsExperience) : 0,
        pricing_info: pricingInfo,
        mobility_scope: mobilityScope || "selected",
        mobility_cities: mobilityScope === "selected" ? mobilityCities : [],
        services,
        mobile_money_operator: mobileMoneyOperator || null,
        mobile_money_number: mobileMoneyNumber || null,
      });
    }
  }

  const confirmParams = new URLSearchParams();
  if (role) confirmParams.set("role", role);
  if (redirectTo) confirmParams.set("redirect", redirectTo);
  const confirmUrl = `/auth/confirm-email${confirmParams.toString() ? `?${confirmParams.toString()}` : ""}`;
  redirect(confirmUrl);
}

export async function login(formData) {
  const supabase = createClient();

  const identifier = formData.get("identifier"); // email OU numéro de téléphone
  const password = formData.get("password");
  const redirectTo = formData.get("redirect"); // page à retrouver après connexion

  const { email } = toAuthIdentity(identifier);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorUrl = redirectTo
      ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(error.message)}`
      : `/auth/login?error=${encodeURIComponent(error.message)}`;
    return redirect(errorUrl);
  }

  // Rattrapage : si le profil n'existe pas encore (cas de la confirmation
  // d'email qui a retardé sa création), on le crée maintenant.
  await ensureProfile(supabase, data.user);

  // Renvoie la personne exactement là où elle voulait aller
  // (ex: reprendre la prise de RDV sur la fiche d'un artisan).
  redirect(redirectTo || "/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
