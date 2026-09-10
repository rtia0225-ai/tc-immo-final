import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "../auth/actions";
import ProjectTimeline from "@/components/ProjectTimeline";

const CLIENT_TABS = [
  { key: "projets", label: "Mes projets" },
  { key: "paiements", label: "Paiements" },
  { key: "messagerie", label: "Messagerie" },
  { key: "documents", label: "Documents" },
];

export default async function DashboardPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const activeTab = searchParams?.tab || "projets";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .single();
  const isArtisan = profile?.role === "artisan";

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, amount, currency, created_at")
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const activeProject = (projects || []).find(
    (p) => p.status !== "released" && p.status !== "cancelled"
  );

  let milestones = [];
  if (activeProject) {
    const { data } = await supabase
      .from("project_milestones")
      .select("*")
      .eq("project_id", activeProject.id)
      .order("order_index", { ascending: true });
    milestones = data || [];
  }

  const projetsEnCours = (projects || []).filter(
    (p) => p.status !== "released" && p.status !== "cancelled"
  ).length;
  const etapesValidees = milestones.filter((m) => m.is_completed).length;
  const totalEtapes = milestones.length;
  const avancement = totalEtapes > 0 ? Math.round((etapesValidees / totalEtapes) * 100) : 0;

  // Onglet Messagerie (client uniquement)
  let conversations = [];
  if (!isArtisan && activeTab === "messagerie") {
    const { data } = await supabase
      .from("conversations")
      .select(
        `id, created_at,
         client:client_id ( full_name ),
         artisan:artisan_id ( trade, profiles ( full_name ) )`
      )
      .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    conversations = data || [];
  }

  // Raccourcis artisan : nouveaux messages / nouveaux rendez-vous
  let unreadCount = 0;
  let upcomingCount = 0;
  if (isArtisan) {
    const { data: myConversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`);
    const conversationIds = (myConversations || []).map((c) => c.id);

    if (conversationIds.length > 0) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id)
        .is("read_at", null);
      unreadCount = count || 0;
    }

    const { data: appts } = await supabase
      .from("appointments")
      .select("id")
      .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
      .in("status", ["proposed", "confirmed"])
      .gte("scheduled_at", new Date().toISOString());
    upcomingCount = appts?.length || 0;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Bandeau d'accueil */}
      <div className="rounded-lg bg-forest p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-heading font-bold">
              {profile?.full_name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-heading font-bold">Bonjour, {profile?.full_name}</p>
              <p className="text-xs text-white/70">Compte {isArtisan ? "artisan" : "client"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isArtisan && (
              <Link href="/dashboard/profile" className="text-xs text-white/80 underline hover:text-white">
                Mes infos
              </Link>
            )}
            <form action={logout}>
              <button className="text-xs text-white/70 hover:text-white">Déconnexion</button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/20 border-t border-white/20 pt-4 text-center">
          <div>
            <p className="font-heading text-xl font-bold">{projetsEnCours}</p>
            <p className="text-[11px] text-white/70">Projet en cours</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold">{avancement}%</p>
            <p className="text-[11px] text-white/70">Avancement</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold">{etapesValidees}/{totalEtapes}</p>
            <p className="text-[11px] text-white/70">Étapes validées</p>
          </div>
        </div>
      </div>

      {isArtisan ? (
        <>
          {/* Raccourcis artisan */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/messages"
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-ink">Nouveaux messages</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
              )}
            </Link>
            <Link
              href="/appointments"
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-ink">Nouveaux rendez-vous</span>
              {upcomingCount > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{upcomingCount}</span>
              )}
            </Link>
          </div>

          <Link
            href="/dashboard/revenus"
            className="mt-3 block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm"
          >
            <span className="text-sm font-semibold text-ink">Mes revenus</span>
            <p className="mt-0.5 text-xs text-gray-500">Paiements perçus et en attente</p>
          </Link>

          {/* Projets en cours */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-gray-700">Projets en cours</p>
            {activeProject ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <p className="font-heading font-bold">{activeProject.title}</p>

                <div className="mt-4">
                  <ProjectTimeline
                    projectId={activeProject.id}
                    milestones={milestones}
                    isArtisan={true}
                    currency={activeProject.currency}
                  />
                </div>

                <Link
                  href={`/projects/${activeProject.id}`}
                  className="mt-4 block rounded-lg bg-forest py-2 text-center text-xs font-semibold text-white hover:bg-forest-dark"
                >
                  Ouvrir le projet (documents, messagerie)
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">Aucun projet en cours pour le moment.</p>
            )}

            {projects && projects.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 text-sm hover:shadow-sm">
                    <span>{p.title}</span>
                    <span className="text-gray-500">{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Onglets client */}
          <div className="mt-6 flex gap-6 border-b border-gray-200 text-sm font-medium">
            {CLIENT_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/dashboard?tab=${tab.key}`}
                className={`-mb-px border-b-2 pb-2 ${
                  activeTab === tab.key ? "border-brand text-brand" : "border-transparent text-gray-500"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "projets" && (
              <>
                {activeProject ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-heading font-bold">{activeProject.title}</p>
                      <Link
                        href={`/live/${activeProject.id}`}
                        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        Ouvrir la caméra
                      </Link>
                    </div>

                    <div className="mt-4">
                      <ProjectTimeline
                        projectId={activeProject.id}
                        milestones={milestones}
                        isArtisan={false}
                        currency={activeProject.currency}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href={`/projects/${activeProject.id}`} className="rounded-lg border border-gray-200 py-2 text-center text-xs font-medium hover:bg-gray-50">
                        Documents
                      </Link>
                      <Link href={`/projects/${activeProject.id}`} className="rounded-lg bg-forest py-2 text-center text-xs font-medium text-white hover:bg-forest-dark">
                        Messagerie
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun projet en cours pour le moment.</p>
                )}

                {projects && projects.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Historique</p>
                    <div className="flex flex-col gap-2">
                      {projects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 text-sm hover:shadow-sm">
                          <span>{p.title}</span>
                          <span className="text-gray-500">{p.status}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "paiements" && (
              <div className="flex flex-col gap-2">
                {!projects || projects.length === 0 ? (
                  <p className="text-gray-500">Aucun paiement pour le moment.</p>
                ) : (
                  projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 text-sm">
                      <span>{p.title}</span>
                      <span className="font-medium">{p.amount} {p.currency} — {p.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "messagerie" && (
              <div className="flex flex-col gap-2">
                {conversations.length === 0 ? (
                  <p className="text-gray-500">Aucune conversation pour le moment.</p>
                ) : (
                  conversations.map((c) => (
                    <Link key={c.id} href={`/messages/${c.id}`} className="rounded-lg border border-gray-100 bg-white p-3 text-sm hover:shadow-sm">
                      Conversation avec {c.artisan?.profiles?.full_name || c.client?.full_name}
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <p className="text-gray-500">
                Bientôt : dépôt et partage de documents liés à tes projets.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
