import { startConversation } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-heading mb-4 text-xl font-bold">
        Démarrer la conversation
      </h1>
      <form action={startConversation}>
        <input type="hidden" name="artisanId" value={artisanId} />
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-2 font-medium text-white hover:bg-brand-dark"
        >
          Envoyer un premier message
        </button>
      </form>
    </div>
  );
}
