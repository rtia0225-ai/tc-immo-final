export default function Footer() {
  return (
    <footer className="border-t border-line bg-stone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-heading text-lg font-semibold text-ink">TC—Immo</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
            La marketplace de confiance pour construire en Côte d'Ivoire depuis l'étranger.
            Artisans vérifiés, paiement séquestré, suivi de chantier en temps réel.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Plateforme</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/60">
            <li><a href="/artisans" className="hover:text-ink">Trouver un prestataire</a></li>
            <li><a href="#" className="hover:text-ink">À propos</a></li>
            <li><a href="#" className="hover:text-ink">Comment ça marche</a></li>
            <li><a href="#" className="hover:text-ink">Ressources</a></li>
            <li><a href="#" className="hover:text-ink">FAQ</a></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl border-t border-line px-4 py-5 text-xs text-ink/40">
        © 2026 TC—Immo. Tous droits réservés.
      </p>
    </footer>
  );
}
