// Traduit les statuts techniques (stockés en anglais en base de données)
// en libellés français affichés à l'écran. Ne jamais afficher le statut
// brut directement (project.status) — toujours passer par cette fonction.
export const PROJECT_STATUS_LABELS = {
  draft: "Brouillon",
  awaiting_payment: "En attente de paiement",
  funded: "Fonds séquestrés",
  in_progress: "Travaux en cours",
  completed: "Travaux terminés",
  disputed: "Litige en cours",
  released: "Paiement libéré",
  cancelled: "Annulé",
};

export function translateStatus(status) {
  return PROJECT_STATUS_LABELS[status] || status;
}
