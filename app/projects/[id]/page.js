import { createClient } from "@/lib/supabase/server";
import EscrowStatus from "@/components/EscrowStatus";
import ProjectTimeline from "@/components/ProjectTimeline";
import { advanceProjectStatus, removeParticipant } from "../actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const NEXT_STATUS = {
  draft: "awaiting_payment",
  awaiting_payment: "funded",
  funded: "in_progress",
  in_progress: "completed",
  completed: "released",
};

export default async function ProjectPage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isArtisan = profile?.role === "artisan";

  const { data: project } = await supabase
    .from("projects")
    .select("*, artisan:artisan_id ( trade, profiles ( full_name, avatar_url ) )")
    .eq("id", id)
    .single();

  if (!project) return <p>Projet introuvable.</p>;

  const { data: participants } = await supabase
    .from("project_participants")
    .select("id, artisan_id, artisan:artisan_id ( trade, profiles ( full_name, avatar_url ) )")
    .eq("project_id", id);

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("order_index", { ascending: true });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", id)
    .maybeSingle();

  const { data: contract } = await supabase
    .from("contracts")
    .select("client_signed_at, artisan_signed_at")
    .eq("project_id", id)
    .maybeSingle();
  const contractFullySigned = !!contract?.client_signed_at && !!contract?.artisan_signed_at;

  const nextStatus = NEXT_STATUS[project.status];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-brand-dark">
        {project.title}
      </h1>
      <p className="mb-6 text-gray-600">{project.description}</p>

      {contract && !contractFullySigned && (
        <Link
          href={`/projects/${project.id}/contract`}
          className="mb-6 block rounded-lg border border-brand bg-brand-light p-4 text-sm font-medium text-brand-dark hover:opacity-90"
        >
          Contrat en attente de signature — clique pour le consulter et signer
        </Link>
      )}

      {/* Participants au projet */}
      <div className="mb-6 rounded-lg border border-brand-light bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Participants</h2>
          {!isArtisan && (
            <Link
              href={`/projects/${project.id}/add-participant`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
              aria-label="Ajouter un participant"
            >
              +
            </Link>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {project.artisan?.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.artisan.profiles.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-300">
                {project.artisan?.profiles?.full_name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{project.artisan?.profiles?.full_name}</p>
              <p className="text-xs text-gray-500">{project.artisan?.trade} · Principal</p>
            </div>
          </div>

          {participants?.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {p.artisan?.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.artisan.profiles.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-300">
                    {p.artisan?.profiles?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{p.artisan?.profiles?.full_name}</p>
                  <p className="text-xs text-gray-500">{p.artisan?.trade}</p>
                </div>
              </div>
              {!isArtisan && (
                <form action={removeParticipant}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="participantId" value={p.id} />
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                    Retirer
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paiements (escrow) */}
      <div className="mb-6 rounded-lg border border-brand-light bg-white p-5">
        <h2 className="mb-3 font-semibold">Mes paiements</h2>
        <EscrowStatus
          status={project.status}
          amount={project.amount}
          currency={project.currency}
        />

        {nextStatus && (
          <form action={advanceProjectStatus} className="mt-4">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="newStatus" value={nextStatus} />
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Faire avancer le statut → {nextStatus}
            </button>
          </form>
        )}
      </div>

      {/* Suivi général / chronogramme */}
      <div className="mb-6">
        <ProjectTimeline
          projectId={project.id}
          milestones={milestones}
          isArtisan={isArtisan}
          currency={project.currency}
        />
      </div>

      {/* Raccourcis : messagerie, rendez-vous, documents, caméra */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={conversation ? `/messages/${conversation.id}` : "/messages"}
          className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
        >
          <p className="font-medium">Ma messagerie</p>
          <p className="text-sm text-gray-500">
            Fil de discussion sur ce projet
          </p>
        </Link>

        <Link
          href={`/appointments/new?artisan=${project.artisan_id}&project=${project.id}`}
          className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
        >
          <p className="font-medium">Mes rendez-vous</p>
          <p className="text-sm text-gray-500">
            Planifier ou consulter un appel
          </p>
        </Link>

        <Link
          href={`/projects/${project.id}/contract`}
          className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
        >
          <p className="font-medium">Contrat</p>
          <p className="text-sm text-gray-500">
            {contractFullySigned ? "Signé par les deux parties" : "Voir et signer le contrat"}
          </p>
        </Link>

        <div className="rounded-lg border border-brand-light bg-white p-4">
          <p className="font-medium">Mes documents</p>
          <p className="text-sm text-gray-500">
            Devis, plans et pièces liées au projet
          </p>
        </div>

        {!isArtisan && (
          <Link
            href={`/live/${project.id}`}
            className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
          >
            <p className="font-medium">Ouvrir la caméra</p>
            <p className="text-sm text-gray-500">
              Voir le flux caméra du chantier
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
