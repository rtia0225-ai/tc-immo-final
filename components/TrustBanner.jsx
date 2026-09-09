const ITEMS = [
  {
    title: "Paiement séquestré",
    text: "Les fonds sont bloqués sur la plateforme et ne sont libérés qu'à validation de chaque étape.",
  },
  {
    title: "Suivi de chantier en temps réel",
    text: "Chaque avancement est documenté et consultable depuis votre espace, où que vous soyez.",
  },
  {
    title: "Artisans vérifiés RCCM",
    text: "Chaque prestataire est audité avant d'être référencé sur la plateforme.",
  },
  {
    title: "Responsabilité assumée",
    text: "Toute fraude concernant un paiement effectué sur la plateforme est de notre ressort.",
  },
];

export default function TrustBanner() {
  return (
    <div className="border-t border-forest-dark bg-forest px-4 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-heading text-lg text-white/90">Ce que garantit TC—Immo</p>
        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <div key={item.title} className="border-t border-white/25 pt-4">
              <p className="text-xs text-white/50">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-heading text-base font-medium">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
