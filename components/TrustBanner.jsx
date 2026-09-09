const ITEMS = [
  {
    title: "Paiement 100% sécurisé",
    text: "Vos paiements restent séquestrés sur la plateforme et ne sont libérés qu'à validation.",
  },
  {
    title: "Suivi en temps réel",
    text: "Consultez l'avancement de votre chantier depuis votre espace, où que vous soyez.",
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
    <div className="bg-forest px-4 py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title}>
            <p className="font-heading text-base font-bold">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
