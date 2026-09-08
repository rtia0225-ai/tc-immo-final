import { toggleMilestone, addMilestone } from "@/app/projects/milestones-actions";

export default function ProjectTimeline({
  projectId,
  milestones,
  isArtisan,
}) {
  return (
    <div className="rounded-xl border border-brand-light bg-white p-5">
      <h2 className="mb-3 font-semibold">Espace de suivi général</h2>

      {!milestones || milestones.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucune étape définie pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              {isArtisan ? (
                <form action={toggleMilestone}>
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <input
                    type="hidden"
                    name="isCompleted"
                    value={String(m.is_completed)}
                  />
                  <button
                    type="submit"
                    className={`h-5 w-5 rounded border ${
                      m.is_completed
                        ? "border-brand bg-brand text-white"
                        : "border-gray-300"
                    }`}
                    aria-label="Cocher l'étape"
                  >
                    {m.is_completed ? "✓" : ""}
                  </button>
                </form>
              ) : (
                <span
                  className={`h-5 w-5 rounded border ${
                    m.is_completed
                      ? "border-brand bg-brand text-white"
                      : "border-gray-300"
                  } flex items-center justify-center text-xs`}
                >
                  {m.is_completed ? "✓" : ""}
                </span>
              )}
              <span
                className={
                  m.is_completed ? "text-gray-400 line-through" : ""
                }
              >
                {m.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isArtisan && (
        <form
          action={addMilestone}
          className="mt-4 flex gap-2 border-t border-gray-100 pt-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <input
            name="title"
            placeholder="Nouvelle étape (ex: Livraison des matériaux)"
            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            + Ajouter
          </button>
        </form>
      )}

      {!isArtisan && (
        <p className="mt-3 text-xs text-gray-500">
          Seul l'artisan peut ajouter ou cocher les étapes. Vous ne pouvez
          que les consulter.
        </p>
      )}
    </div>
  );
}
