export default function Footer() {
  return (
    <footer className="bg-ink px-4 py-14 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2">
        <div>
          <p className="font-heading text-lg font-extrabold">
            <span className="text-brand">TC</span>
            <span className="text-gray-500">-</span>
            <span className="text-forest-light">Immo</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
            La marketplace de confiance pour construire en Côte d'Ivoire depuis l'étranger.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Plateforme</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/artisans" className="hover:text-brand">Trouver un prestataire</a></li>
            <li><a href="/a-propos" className="hover:text-brand">À propos</a></li>
            <li><a href="/comment-ca-marche" className="hover:text-brand">Comment ça marche</a></li>
            <li><a href="/ressources" className="hover:text-brand">Ressources</a></li>
            <li><a href="/faq" className="hover:text-brand">FAQ</a></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-gray-500">
        © 2026 TC-Immo. Tous droits réservés.
      </p>
    </footer>
  );
}
