const ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="1" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Paiement 100% sécurisé",
    text: "Vos paiements restent séquestrés sur la plateforme et ne sont libérés qu'à validation.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      </svg>
    ),
    title: "Suivi en temps réel",
    text: "Consultez l'avancement de votre chantier depuis votre espace, où que vous soyez.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Artisans vérifiés RCCM",
    text: "Chaque prestataire est audité avant d'être référencé sur la plateforme.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2 3 7v6c0 5.5 3.8 9.7 9 11 5.2-1.3 9-5.5 9-11V7l-9-5Z" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
    ),
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
            <div className="text-white/80">{item.icon}</div>
            <p className="font-heading mt-3 text-base font-bold">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
