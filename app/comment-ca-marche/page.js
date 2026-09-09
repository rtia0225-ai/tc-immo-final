const STEPS = [
  { n: 1, title: "Choisissez votre prestataire", text: "Consultez les profils vérifiés, les avis, les réalisations." },
  { n: 2, title: "Sécurisez vos travaux", text: "Recevez le devis et signez le contrat tripartite." },
  { n: 3, title: "Payez en sécurité", text: "Les fonds restent séquestrés jusqu'à validation de chaque étape." },
  { n: 4, title: "Suivez vos travaux", text: "Consultez l'avancement de votre chantier depuis votre espace." },
];

export default function CommentCaMarchePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-heading text-3xl font-bold text-ink">Comment ça marche</h1>
      <div className="mt-8 flex flex-col gap-6">
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-sm font-bold text-white">
              {s.n}
            </div>
            <div>
              <p className="font-heading font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
