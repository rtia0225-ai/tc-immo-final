const ITEMS = [
  {
    icon: "🔒",
    title: "Paiement 100% sécurisé",
    text: "Tous les paiements se font sur notre plateforme et vous payez à votre rythme",
  },
  {
    icon: "📡",
    title: "Suivez votre chantier en temps réel",
    text: "Les états d'avancement documentés dans votre espace",
  },
  {
    icon: "✅",
    title: "Artisans vérifiés RCCM",
    text: "Chaque prestataire est audité avant référencement",
  },
  {
    icon: "⚖️",
    title: "Responsabilité assumée",
    text: "Toute fraude concernant des paiements sur plateforme est de notre ressort",
  },
];

export default function TrustBanner() {
  return (
    <div className="bg-forest px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
              {item.icon}
            </div>
            <div>
              <p className="font-heading text-sm font-bold">{item.title}</p>
              <p className="mt-1 text-xs text-white/85">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
