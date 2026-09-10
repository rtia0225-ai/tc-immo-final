import { toggleMilestone, releasePayment } from "@/app/projects/milestones-actions";

// Chronologie "ligne + points" : chaque étape porte un montant lié au
// contrat. L'artisan coche l'étape une fois le travail fait (date
// horodatée), puis le client confirme le virement correspondant (date
// horodatée séparément).
export default function ProjectTimeline({
  projectId,
  milestones,
  isArtisan,
  currency,
}) {
  return (
    <div className="rounded-lg border border-brand-light bg-white p-5">
      <h2 className="mb-4 font-semibold">Échéancier de paiement</h2>

      {!milestones || milestones.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun échéancier défini pour ce projet.
        </p>
      ) : (
        <ol className="relative border-l-2 border-gray-200 pl-6">
          {milestones.map((m) => (
            <li key={m.id} className="mb-6 last:mb-0">
              <span
                className={`absolute -left-[9px] mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  m.paid_at
                    ? "border-forest bg-forest"
                    : m.is_completed
                      ? "border-brand bg-brand"
                      : "border-gray-300 bg-white"
                }`}
              />

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`font-medium ${m.is_completed ? "text-ink" : "text-gray-500"}`}>
                  {m.title}
                </p>
                {m.amount != null && (
                  <p className="text-sm font-semibold text-gray-700">
                    {m.amount.toLocaleString("fr-FR")} {currency}
                    {m.payment_percentage != null && (
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        ({m.payment_percentage}%)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Case à cocher côté artisan */}
              {isArtisan && !m.is_completed && (
                <form action={toggleMilestone} className="mt-2">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="isCompleted" value="false" />
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                  >
                    Marquer comme terminé
                  </button>
                </form>
              )}

              {m.is_completed && (
                <p className="mt-1 text-xs text-gray-400">
                  Terminé par l'artisan le {new Date(m.completed_at).toLocaleDateString("fr-FR")}
                </p>
              )}

              {/* Bouton de virement côté client, une fois l'étape validée */}
              {!isArtisan && m.is_completed && !m.paid_at && (
                <form action={releasePayment} className="mt-2">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <button
                    type="submit"
                    className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-dark"
                  >
                    Confirmer le virement effectué
                  </button>
                </form>
              )}

              {m.paid_at && (
                <p className="mt-1 text-xs font-medium text-forest">
                  Paiement confirmé le {new Date(m.paid_at).toLocaleDateString("fr-FR")}
                </p>
              )}

              {!m.is_completed && !isArtisan && (
                <p className="mt-1 text-xs text-gray-400">En attente de l'artisan</p>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        L'échéancier a été défini par le client à la création du projet, selon le contrat convenu avec l'artisan — il ne peut plus être modifié.
      </p>
    </div>
  );
}
