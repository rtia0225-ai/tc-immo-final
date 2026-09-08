import { createClient } from "@/lib/supabase/server";
import EscrowStatus from "@/components/EscrowStatus";
import ProjectTimeline from "@/components/ProjectTimeline";
import { advanceProjectStatus } from "../actions";
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
    .select("*")
    .eq("id", id)
    .single();

  if (!project) return <p>Projet introuvable.</p>;

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

  const nextStatus = NEXT_STATUS[project.status];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-brand-dark">
        {project.title}
      </h1>
      <p className="mb-6 text-gray-600">{project.description}</p>

      {/* Paiements (escrow) */}
      <div className="mb-6 rounded-xl border border-brand-light bg-white p-5">
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

        <div className="rounded-lg border border-brand-light bg-white p-4">
          <p className="font-medium">Mes documents</p>
          <p className="text-sm text-gray-500">
            Bientôt : dépôt et partage de documents liés au projet
          </p>
        </div>

        <Link
          href={`/live/${project.id}`}
          className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
        >
          <p className="font-medium">Ouvrir la caméra</p>
          <p className="text-sm text-gray-500">
            Voir le flux caméra du chantier
          </p>
        </Link>
      </div>
    </div>
  );
}
