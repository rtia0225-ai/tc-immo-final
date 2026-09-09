const ITEMS = [
  {
    icon: "🔒",
    color: "bg-brand",
    title: "Paiement 100% sécurisé",
    text: "Vos paiements restent séquestrés sur la plateforme et ne sont libérés qu'à validation.",
  },
  {
    icon: "📡",
    color: "bg-azure",
    title: "Suivi en temps réel",
    text: "Consultez l'avancement de votre chantier depuis votre espace, où que vous soyez.",
  },
  {
    icon: "✅",
    color: "bg-forest",
    title: "Artisans vérifiés RCCM",
    text: "Chaque prestataire est audité avant d'être référencé sur la plateforme.",
  },
  {
    icon: "⚖️",
    color: "bg-gold",
    title: "Responsabilité assumée",
    text: "Toute fraude concernant un paiement effectué sur la plateforme est de notre ressort.",
  },
];

export default function TrustBanner() {
  return (
    <div className="bg-gradient-to-br from-forest via-forest to-forest-dark px-4 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white/10 p-5 backdrop-blur hover:-translate-y-1 hover:bg-white/15"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${item.color}`}>
              {item.icon}
            </div>
            <p className="font-heading mt-4 text-base font-bold">{item.title}</p>
            <p className="mt-1.5 text-sm text-white/80">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
