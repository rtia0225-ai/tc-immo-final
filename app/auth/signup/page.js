import { signup } from "../actions";
import Link from "next/link";
import { CONSTRUCTION_SERVICES } from "@/lib/constants";

export default function SignupPage({ searchParams }) {
  const role = searchParams?.role; // 'client' ou 'artisan', choisi à l'étape précédente
  const redirectTo = searchParams?.redirect || "";
  const qs = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : "";

  if (!role) {
    // Étape 1 : choix du rôle
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-16 text-center">
        <h1 className="font-heading text-3xl font-extrabold">Créez un compte</h1>

        <div className="mt-4 flex w-full max-w-sm flex-col gap-4">
          <Link
            href={`/auth/signup?role=client${qs}`}
            className="rounded-xl bg-forest py-4 font-heading font-bold text-white hover:bg-forest-dark"
          >
            Je veux construire une maison
          </Link>
          <Link
            href={`/auth/signup?role=artisan${qs}`}
            className="rounded-xl bg-brand py-4 font-heading font-bold text-white hover:bg-brand-dark"
          >
            Je suis un artisan
          </Link>
          <p className="text-sm text-gray-500">Ou</p>
          <Link
            href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
            className="rounded-xl border-2 border-brand py-3 font-heading font-semibold text-brand hover:bg-brand-light"
          >
            Connexion
          </Link>
        </div>
      </div>
    );
  }

  // Étape 2 : formulaire, une fois le rôle choisi
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-2xl font-bold">
        {role === "artisan" ? "Inscription — Artisan" : "Inscription — Client"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <Link href={`/auth/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="underline">
          ← Changer de profil
        </Link>
      </p>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{searchParams.error}</p>
      )}

      <form action={signup} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="redirect" value={redirectTo} />

        <div>
          <label className="mb-1 block text-sm font-medium">Nom complet</label>
          <input name="fullName" required className="w-full rounded-lg border border-gray-300 p-2" />
        </div>

        {role === "artisan" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Métier principal</label>
            <select name="trade" required defaultValue="" className="w-full rounded-lg border border-gray-300 p-2">
              <option value="" disabled>Choisir un métier</option>
              {CONSTRUCTION_SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Tu pourras préciser tous tes autres services depuis ton profil après inscription.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" name="email" required className="w-full rounded-lg border border-gray-300 p-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input type="password" name="password" required minLength={6} className="w-full rounded-lg border border-gray-300 p-2" />
        </div>

        <button
          type="submit"
          className={`mt-2 rounded-lg py-3 font-heading font-bold text-white ${
            role === "artisan" ? "bg-brand hover:bg-brand-dark" : "bg-forest hover:bg-forest-dark"
          }`}
        >
          Créer mon compte
        </button>
      </form>
    </div>
  );
}
