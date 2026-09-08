import Link from "next/link";

export default function ConfirmEmailPage({ searchParams }) {
  const redirectTo = searchParams?.redirect || "";
  const loginHref = redirectTo
    ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/auth/login";

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-heading mb-4 text-2xl font-bold">Compte créé !</h1>
      <p className="text-gray-600">
        Ton compte est prêt. Connecte-toi dès maintenant pour continuer.
      </p>
      <Link
        href={loginHref}
        className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-heading font-bold text-white hover:bg-brand-dark"
      >
        Se connecter
      </Link>
    </div>
  );
}
