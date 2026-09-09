import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "../auth/actions";

const TABS = [
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

  // Le "chantier" mis en avant : le projet actif le plus récent
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

  // Données pour l'onglet Messagerie
  let conversations = [];
  if (activeTab === "messagerie") {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Bandeau d'accueil avec indicateurs */}
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
                Modifier mon profil
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

      {/* Onglets */}
      <div className="mt-6 flex gap-6 border-b border-gray-200 text-sm font-medium">
        {TABS.map((tab) => (
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

                {/* Chronogramme */}
                <div className="mt-4 flex items-center justify-between">
                  {milestones.map((m, i) => (
                    <div key={m.id} className="flex flex-1 flex-col items-center text-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          m.is_completed ? "bg-forest text-white" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {m.is_completed ? "✓" : i + 1}
                      </div>
                      <p className="mt-1 text-[10px] text-gray-500">{m.title}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Link href={`/projects/${activeProject.id}`} className="rounded-lg border border-gray-200 py-2 text-center text-xs font-medium hover:bg-gray-50">
                    Documents
                  </Link>
                  <Link href={`/projects/${activeProject.id}`} className="rounded-lg bg-forest py-2 text-center text-xs font-medium text-white hover:bg-forest-dark">
                    Messagerie
                  </Link>
                  <Link href={`/projects/${activeProject.id}`} className="rounded-lg bg-brand py-2 text-center text-xs font-medium text-white hover:bg-brand-dark">
                    Paiements
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
    </div>
  );
}
