const STEPS = [
  { key: "draft", label: "Brouillon" },
  { key: "awaiting_payment", label: "En attente de paiement" },
  { key: "funded", label: "Fonds séquestrés" },
  { key: "in_progress", label: "Travaux en cours" },
  { key: "completed", label: "Travaux terminés" },
  { key: "released", label: "Paiement libéré" },
];

export default function EscrowStatus({ status, amount, currency }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  if (status === "disputed" || status === "cancelled") {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Statut : {status === "disputed" ? "Litige en cours" : "Annulé"}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 font-medium">
        Montant séquestré : {amount} {currency}
      </p>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step, i) => (
          <span
            key={step.key}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i <= currentIndex
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Note technique : la logique réelle de séquestre (retenue et
        libération des fonds) doit être branchée à un prestataire de
        paiement — voir README pour l'intégration Stripe Connect / CinetPay.
      </p>
    </div>
  );
}
