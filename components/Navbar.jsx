import Link from "next/link";

export default function Navbar({ user }) {
  return (
    <header className="border-b border-line bg-stone">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight text-ink">
          TC<span className="text-forest">—</span>Immo
        </Link>

        <div className="hidden items-center gap-8 text-sm text-ink/70 md:flex">
          <Link href="/artisans" className="hover:text-ink">Trouver un artisan</Link>
          {user && (
            <>
              <Link href="/messages" className="hover:text-ink">Messages</Link>
              <Link href="/appointments" className="hover:text-ink">Rendez-vous</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-stone"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-stone"
            >
              Se connecter
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
