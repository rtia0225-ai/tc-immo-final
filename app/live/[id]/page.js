import { createClient } from "@/lib/supabase/server";

// NOTE IMPORTANTE :
// Cette page affiche la structure d'un flux caméra live, mais ne diffuse
// pas de vidéo par elle-même — la diffusion réelle nécessite un
// prestataire de streaming (ex: Mux, Daily.co, Agora, Livepeer).
// playback_url doit contenir l'URL fournie par ce prestataire
// (souvent un flux HLS .m3u8 ou un embed iframe).

export default async function LiveFeedPage({ params }) {
  const supabase = createClient();
  const { id: projectId } = params;

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
        <div className="aspect-video overflow-hidden rounded-xl bg-black">
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
        <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          Le chantier n'est pas en direct actuellement.
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Prestataire configuré : {feed?.provider || "aucun"}. Voir le README
        pour brancher un vrai service de streaming.
      </p>
    </div>
  );
}
