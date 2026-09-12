import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Redirige vers le contrat de l'artisan principal — conservé pour les
// anciens liens qui ne précisaient pas encore quel artisan.
export default async function ContractRedirectPage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const { data: project } = await supabase
    .from("projects")
    .select("artisan_id")
    .eq("id", id)
    .single();

  if (!project) return <p className="px-4 py-12">Projet introuvable.</p>;

  redirect(`/projects/${id}/contract/${project.artisan_id}`);
}
