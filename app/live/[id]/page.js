import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LiveFeedPage({ params }) {
  const supabase = createClient();
  const { id: projectId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, artisan_id")
    .eq("id", projectId)
    .single();

  if (!project) return <p className="px-4 py-12">Projet introuvable.</p>;

  // Le flux caméra est réservé au client, pour suivre son chantier.
  if (user.id !== project.client_id) {
    redirect(`/projects/${projectId}`);
  }

  const { data: feed } = await supabase
    .from("camera_feeds")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-dark">
        Flux caméra du chantier
      </h1>

      {!feed ? (
        <p className="text-gray-600">
          Aucun flux caméra configuré pour ce projet pour le moment.
        </p>
      ) : feed.is_live && feed.playback_url ? (
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          {/* Remplacer par le lecteur HLS de ton prestataire (ex: hls.js,
              Mux Player, ou un simple <iframe src={feed.playback_url} />) */}
          <video
            className="h-full w-full"
            src={feed.playback_url}
            controls
            autoPlay
            muted
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          Le chantier n'est pas en direct actuellement.
        </div>
      )}
    </div>
  );
}
