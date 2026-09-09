import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Pas de page intermédiaire : dès que la personne clique "Discuter par
// message" depuis un profil artisan, on retrouve (ou on crée) directement
// la conversation et on atterrit tout de suite dans la messagerie.
export default async function NewConversationPage({ searchParams }) {
  const artisanId = searchParams?.artisan;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const currentPath = `/messages/new?artisan=${artisanId}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", user.id)
    .eq("artisan_id", artisanId)
    .is("project_id", null)
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ client_id: user.id, artisan_id: artisanId })
    .select("id")
    .single();

  if (error) {
    redirect(`/artisans/${artisanId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/messages/${created.id}`);
}
