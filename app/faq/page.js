const FAQS = [
  { q: "Comment mon argent est-il protégé ?", a: "Les paiements restent séquestrés sur la plateforme et ne sont libérés à l'artisan qu'après validation de chaque étape du chantier." },
  { q: "Comment les artisans sont-ils vérifiés ?", a: "Chaque artisan est audité (dont vérification RCCM) avant d'être référencé sur la plateforme." },
  { q: "Puis-je suivre mon chantier à distance ?", a: "Oui, votre espace personnel affiche l'avancement en temps réel, avec accès à la caméra du chantier." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-heading text-3xl font-bold text-ink">Questions fréquentes</h1>
      <div className="mt-8 flex flex-col divide-y divide-gray-100">
        {FAQS.map((item) => (
          <div key={item.q} className="py-5">
            <p className="font-heading font-bold text-ink">{item.q}</p>
            <p className="mt-1.5 text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
