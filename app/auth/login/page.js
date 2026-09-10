import { login } from "../actions";
import Link from "next/link";

export default function LoginPage({ searchParams }) {
  const redirectTo = searchParams?.redirect || "";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-2xl font-bold">Connexion</h1>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{searchParams.error}</p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="mb-1 block text-sm font-medium">Email ou numéro de téléphone</label>
          <input
            type="text"
            name="identifier"
            required
            placeholder="email@exemple.com ou 07 00 00 00 00"
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input type="password" name="password" required className="w-full rounded-lg border border-gray-300 p-2" />
        </div>
        <button type="submit" className="mt-2 rounded-lg bg-brand py-3 font-heading font-bold text-white hover:bg-brand-dark">
          Se connecter
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">Pas encore de compte ?</p>
      <Link
        href={redirectTo ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}` : "/auth/signup"}
        className="mt-2 block rounded-lg border-2 border-forest py-3 text-center font-heading font-bold text-forest hover:bg-forest-light"
      >
        Créer un compte
      </Link>
    </div>
  );
}
