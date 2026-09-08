export default function Footer() {
  return (
    <footer className="bg-gray-900 px-4 py-10 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
        <div>
          <p className="font-heading text-lg font-extrabold">
            <span className="text-forest">TC</span> - <span className="text-brand">Immo</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-gray-400">
            La marketplace de confiance pour construire en Côte d'Ivoire depuis l'étranger.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plateforme</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/artisans" className="hover:text-white">Trouver un prestataire</a></li>
            <li><a href="#" className="hover:text-white">À propos</a></li>
            <li><a href="#" className="hover:text-white">Comment ça marche</a></li>
            <li><a href="#" className="hover:text-white">Ressources</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-gray-800 pt-6 text-xs text-gray-500">
        © 2026 TC - Immo. Tous droits réservés.
      </p>
    </footer>
  );
}
