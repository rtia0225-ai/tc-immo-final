"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 items-center justify-center text-ink hover:text-brand"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TC-Immo" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:+2250000000000" aria-label="Appeler" className="flex h-9 w-9 items-center justify-center text-ink hover:text-brand">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="whitespace-nowrap rounded-md bg-brand px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-dark sm:text-sm"
            >
              Connexion / Inscription
            </Link>
          )}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm font-medium text-ink">
            <Link href="/a-propos" className="rounded px-2 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              À propos
            </Link>
            <Link href="/comment-ca-marche" className="rounded px-2 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Comment ça marche
            </Link>
            <Link href="/ressources" className="rounded px-2 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Ressources
            </Link>
            <Link href="/faq" className="rounded px-2 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
