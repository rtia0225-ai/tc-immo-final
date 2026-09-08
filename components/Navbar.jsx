import Link from "next/link";

export default function Navbar({ user }) {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-xl font-extrabold">
          <span className="text-forest">TC</span>
          <span className="text-gray-800"> - </span>
          <span className="text-brand">Immo</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/artisans" className="hover:text-brand">Trouver un artisan</Link>
          {user && (
            <>
              <Link href="/messages" className="hover:text-brand">Messages</Link>
              <Link href="/appointments" className="hover:text-brand">Rendez-vous</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:+2250000000000" aria-label="Appeler" className="hidden text-gray-700 sm:block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Se connecter
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
