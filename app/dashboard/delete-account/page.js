import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { deleteAccount } from "../actions";
import { translateStatus } from "@/lib/statusLabels";

export default async function DeleteAccountPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: activeProjects } = await supabase
    .from("projects")
    .select("id, title, status")
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
    .not("status", "in", "(released,cancelled)");

  const hasActiveProject = activeProjects && activeProjects.length > 0;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">
        Supprimer mon compte
      </h1>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      {hasActiveProject ? (
        <>
          <p className="mt-4 text-sm text-gray-600">
            Impossible de supprimer ton compte pour le moment : tu as encore {activeProjects.length > 1 ? "des projets en cours" : "un projet en cours"}.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {activeProjects.map((p) => (
              <li key={p.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                {p.title} — <span className="text-gray-500">{translateStatus(p.status)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Ces projets doivent être terminés ou annulés avant de pouvoir supprimer ton compte.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-600">
            Cette action est définitive : ton profil, tes photos, tes messages et ton historique seront supprimés. Cette action ne peut pas être annulée.
          </p>
          <form action={deleteAccount} className="mt-6">
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" required className="mt-1" />
              Je comprends que cette action est définitive et je souhaite supprimer mon compte.
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-red-600 py-3 font-heading font-bold text-white hover:bg-red-700"
            >
              Supprimer définitivement mon compte
            </button>
          </form>
        </>
      )}
    </div>
  );
}
