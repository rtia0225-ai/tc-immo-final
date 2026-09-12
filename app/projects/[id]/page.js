import { createClient } from "@/lib/supabase/server";
import ProjectTimeline from "@/components/ProjectTimeline";
import { advanceProjectStatus, removeParticipant } from "../actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { translateStatus } from "@/lib/statusLabels";

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
    .select("id, artisan_id, amount, description, currency, artisan:artisan_id ( trade, profiles ( full_name, avatar_url ) )")
    .eq("project_id", id);

  // Tous les artisans du projet : le principal + chaque participant,
  // chacun avec sa propre prestation, son propre échéancier, son propre contrat.
  const artisansOnProject = [
    {
      artisanId: project.artisan_id,
      isPrimary: true,
      trade: project.artisan?.trade,
      fullName: project.artisan?.profiles?.full_name,
      avatarUrl: project.artisan?.profiles?.avatar_url,
      amount: project.amount,
      currency: project.currency,
      description: project.description,
    },
    ...(participants || []).map((p) => ({
      artisanId: p.artisan_id,
      isPrimary: false,
      participantId: p.id,
      trade: p.artisan?.trade,
      fullName: p.artisan?.profiles?.full_name,
      avatarUrl: p.artisan?.profiles?.avatar_url,
      amount: p.amount,
      currency: p.currency,
      description: p.description,
    })),
  ];

  const artisanIds = artisansOnProject.map((a) => a.artisanId);

  const { data: allMilestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .in("artisan_id", artisanIds)
    .order("order_index", { ascending: true });

  const { data: allContracts } = await supabase
    .from("contracts")
    .select("artisan_id, client_signed_at, artisan_signed_at")
    .eq("project_id", id)
    .in("artisan_id", artisanIds);

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", id)
    .maybeSingle();

  const unsignedContracts = artisansOnProject.filter((a) => {
    const c = allContracts?.find((c) => c.artisan_id === a.artisanId);
    return c && !(c.client_signed_at && c.artisan_signed_at);
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-brand-dark">
        {project.title}
      </h1>
      <p className="mb-6 text-gray-600">{project.description}</p>

      {unsignedContracts.length > 0 && (
        <div className="mb-6 flex flex-col gap-2">
          {unsignedContracts.map((a) => (
            <Link
              key={a.artisanId}
              href={`/projects/${project.id}/contract/${a.artisanId}`}
              className="block rounded-lg border border-brand bg-brand-light p-4 text-sm font-medium text-brand-dark hover:opacity-90"
            >
              Contrat avec {a.fullName} en attente de signature — clique pour le consulter et signer
            </Link>
          ))}
        </div>
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
          {artisansOnProject.map((a) => (
            <div key={a.artisanId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {a.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-300">
                    {a.fullName?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{a.fullName}</p>
                  <p className="text-xs text-gray-500">{a.trade}{a.isPrimary ? " · Principal" : ""}</p>
                </div>
              </div>
              {!isArtisan && !a.isPrimary && (
                <form action={removeParticipant}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="participantId" value={a.participantId} />
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                    Retirer
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statut global du projet */}
      <div className="mb-6 rounded-lg border border-brand-light bg-white p-5">
        <h2 className="mb-3 font-semibold">Avancement global</h2>
        <p className="text-sm text-gray-600">Statut : {translateStatus(project.status)}</p>
        {(() => {
          const NEXT_STATUS = {
            draft: "awaiting_payment",
            awaiting_payment: "funded",
            funded: "in_progress",
            in_progress: "completed",
            completed: "released",
          };
          const nextStatus = NEXT_STATUS[project.status];
          if (!nextStatus) return null;
          return (
            <form action={advanceProjectStatus} className="mt-3">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="newStatus" value={nextStatus} />
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Faire avancer le statut → {translateStatus(nextStatus)}
              </button>
            </form>
          );
        })()}
      </div>

      {/* Une carte par artisan : sa prestation, son contrat, son échéancier */}
      <div className="mb-6 flex flex-col gap-4">
        {artisansOnProject.map((a) => {
          const contract = allContracts?.find((c) => c.artisan_id === a.artisanId);
          const contractSigned = !!contract?.client_signed_at && !!contract?.artisan_signed_at;
          const artisanMilestones = (allMilestones || []).filter((m) => m.artisan_id === a.artisanId);

          return (
            <div key={a.artisanId} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold">{a.fullName} — {a.trade}</p>
                  {a.description && <p className="mt-0.5 text-sm text-gray-500">{a.description}</p>}
                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    {a.amount} {a.currency}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}/contract/${a.artisanId}`}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold ${
                    contractSigned ? "bg-forest-light text-forest" : "bg-brand text-white"
                  }`}
                >
                  {contractSigned ? "Contrat signé" : "Signer le contrat"}
                </Link>
              </div>

              <div className="mt-4">
                <ProjectTimeline
                  projectId={project.id}
                  milestones={artisanMilestones}
                  isArtisan={isArtisan && user.id === a.artisanId}
                  currency={a.currency}
                />
              </div>
            </div>
          );
        })}
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
