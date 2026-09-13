"use client";

import { useState, useEffect } from "react";
import { SINGLE_INSTALLMENT_TRADES, MIN_INSTALLMENTS_OTHER_TRADES } from "@/lib/constants";

const MASONRY_EXAMPLE_SCHEDULE = [
  { title: "Fondations terminées", percentage: "20" },
  { title: "Élévation des murs", percentage: "20" },
  { title: "Dalle / plancher coulé", percentage: "20" },
  { title: "Chaînage et poteaux terminés", percentage: "20" },
  { title: "Enduits et finitions maçonnerie", percentage: "20" },
];

export default function MilestoneBuilder({ trade }) {
  const singleInstallmentDoc = SINGLE_INSTALLMENT_TRADES[trade]; // ex: "Permis de Construire" ou "ACD"
  const isSingleInstallment = !!singleInstallmentDoc;

  const [rows, setRows] = useState(
    isSingleInstallment
      ? [{ title: `Livraison du ${singleInstallmentDoc}`, percentage: "100" }]
      : [
          { title: "", percentage: "" },
          { title: "", percentage: "" },
          { title: "", percentage: "" },
          { title: "", percentage: "" },
          { title: "", percentage: "" },
        ]
  );

  // Si le métier change après coup (rare, mais par sécurité)
  useEffect(() => {
    if (isSingleInstallment) {
      setRows([{ title: `Livraison du ${singleInstallmentDoc}`, percentage: "100" }]);
    }
  }, [trade]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateRow = (i, field, value) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((r) => [...r, { title: "", percentage: "" }]);
  const removeRow = (i) => {
    if (!isSingleInstallment && rows.length > MIN_INSTALLMENTS_OTHER_TRADES) {
      setRows((r) => r.filter((_, idx) => idx !== i));
    }
  };

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Échéancier de paiement
      </label>

      {isSingleInstallment ? (
        <p className="mb-3 rounded-lg bg-brand-light p-3 text-xs text-brand-dark">
          Pour ce métier, le paiement se fait en <strong>une seule fois</strong>, uniquement à la livraison du {singleInstallmentDoc} sur la plateforme — l'artisan doit envoyer le document pour débloquer le virement.
        </p>
      ) : (
        <>
          <p className="mb-3 rounded-lg bg-brand-light p-3 text-xs text-brand-dark">
            Pour ce métier, tu dois prévoir <strong>au moins {MIN_INSTALLMENTS_OTHER_TRADES} étapes</strong> — le paiement ne peut jamais se faire en une seule fois. Discute de ce découpage avec l'artisan avant de valider.
          </p>

          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            {trade === "Maçonnerie" ? (
              <>
                <p className="font-semibold text-ink">Exemple pour la maçonnerie :</p>
                <p className="mt-1">20% après les fondations, 20% après l'élévation des murs, 20% après la dalle, 20% après le chaînage/poteaux, 20% après les enduits et finitions.</p>
                <button
                  type="button"
                  onClick={() => setRows(MASONRY_EXAMPLE_SCHEDULE.map((r) => ({ ...r })))}
                  className="mt-2 font-medium text-forest hover:underline"
                >
                  Remplir avec cet exemple
                </button>
              </>
            ) : (
              <p>Découpe l'échéancier selon les vraies étapes de <strong>ce métier précis</strong> — ne mélange pas avec le travail d'un autre artisan du projet.</p>
            )}
            <p className="mt-2 font-semibold text-ink">Autre façon de faire :</p>
            <p className="mt-1">Un paiement régulier (chaque semaine ou chaque mois) selon les jours réellement travaillés par l'artisan — à adapter avec lui selon la durée prévue du chantier.</p>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="milestoneTitle"
              value={row.title}
              onChange={(e) => updateRow(i, "title", e.target.value)}
              required
              readOnly={isSingleInstallment}
              placeholder="ex: Fondations terminées"
              className={`flex-1 rounded-lg border border-gray-300 p-2 text-sm ${isSingleInstallment ? "bg-gray-50" : ""}`}
            />
            <input
              name="milestonePercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={row.percentage}
              onChange={(e) => updateRow(i, "percentage", e.target.value)}
              required
              readOnly={isSingleInstallment}
              placeholder="%"
              className={`w-20 rounded-lg border border-gray-300 p-2 text-sm ${isSingleInstallment ? "bg-gray-50" : ""}`}
            />
            {!isSingleInstallment && rows.length > MIN_INSTALLMENTS_OTHER_TRADES && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Supprimer cette étape"
                className="px-2 text-gray-400 hover:text-brand"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {!isSingleInstallment && (
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm font-medium text-forest hover:underline"
        >
          + Ajouter une étape
        </button>
      )}

      <p className={`mt-2 text-xs ${total === 100 ? "text-forest" : "text-brand"}`}>
        Total : {total}% {total !== 100 && "— doit être égal à 100% pour valider"}
        {!isSingleInstallment && rows.length < MIN_INSTALLMENTS_OTHER_TRADES && (
          <span className="ml-2">— minimum {MIN_INSTALLMENTS_OTHER_TRADES} étapes requises</span>
        )}
      </p>
    </div>
  );
}
