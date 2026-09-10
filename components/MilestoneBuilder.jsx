"use client";

import { useState } from "react";

export default function MilestoneBuilder() {
  const [rows, setRows] = useState([
    { title: "", percentage: "" },
    { title: "", percentage: "" },
  ]);

  const updateRow = (i, field, value) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((r) => [...r, { title: "", percentage: "" }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Échéancier de paiement (selon ce que vous avez convenu avec l'artisan)
      </label>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="milestoneTitle"
              value={row.title}
              onChange={(e) => updateRow(i, "title", e.target.value)}
              required
              placeholder="ex: Fondations terminées"
              className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
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
              placeholder="%"
              className="w-20 rounded-lg border border-gray-300 p-2 text-sm"
            />
            {rows.length > 1 && (
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

      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-sm font-medium text-forest hover:underline"
      >
        + Ajouter une étape
      </button>

      <p className={`mt-2 text-xs ${total === 100 ? "text-forest" : "text-brand"}`}>
        Total : {total}% {total !== 100 && "— doit être égal à 100% pour valider"}
      </p>
    </div>
  );
}
