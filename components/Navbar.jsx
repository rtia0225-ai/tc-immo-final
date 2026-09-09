import Link from "next/link";

export default function Navbar({ user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-xl font-extrabold tracking-tight">
          <span className="text-forest">TC</span>
          <span className="text-gray-300">-</span>
          <span className="text-brand">Immo</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-semibold text-gray-600 md:flex">
          <Link href="/artisans" className="hover:text-brand">Trouver un artisan</Link>
          {user && (
            <>
              <Link href="/messages" className="hover:text-azure">Messages</Link>
              <Link href="/appointments" className="hover:text-azure">Rendez-vous</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Mon espace
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-forest hover:bg-forest-light sm:block"
              >
                Créer un compte
              </Link>
              <Link
                href="/auth/login"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
