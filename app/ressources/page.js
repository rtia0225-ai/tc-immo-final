export default function RessourcesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-heading text-3xl font-bold text-ink">Ressources</h1>
      <p className="mt-4 text-gray-600">
        Les grandes étapes administratives pour construire en Côte d'Ivoire, du terrain au permis de construire.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <div>
          <p className="font-heading font-bold text-ink">1. Le terrain</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Le terrain doit être rattaché à un lotissement approuvé par le Ministère de la Construction pour pouvoir engager une demande de permis.
          </p>
        </div>
        <div>
          <p className="font-heading font-bold text-ink">2. Le titre de propriété</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            L'ACD (Arrêté de Concession Définitive) ou le Titre Foncier est le document officiel exigé par l'État — un papier provisoire (attestation, lettre d'attribution) ne suffit pas.
          </p>
        </div>
        <div>
          <p className="font-heading font-bold text-ink">3. Le Certificat d'Urbanisme</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Délivré par le Guichet Unique, il confirme ce qu'il est permis de bâtir sur la parcelle et valide les accès à l'eau, à l'électricité et à l'évacuation des eaux.
          </p>
        </div>
        <div>
          <p className="font-heading font-bold text-ink">4. Le Permis de Construire</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Les plans sont conçus par un architecte agréé (et un ingénieur génie civil pour les projets à charges lourdes), puis déposés au Guichet Unique pour obtenir le permis.
          </p>
        </div>
      </div>

      <a
        href="/"
        className="mt-8 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Trouver ma démarche exacte
      </a>
    </div>
  );
}
