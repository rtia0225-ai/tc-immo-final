import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `id, created_at,
       client:client_id ( full_name ),
       artisan:artisan_id ( trade, profiles ( full_name ) )`
    )
    .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="text-gray-600">Aucune conversation pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="rounded-lg border border-brand-light bg-white p-4 hover:shadow-sm"
            >
              Conversation avec{" "}
              {c.artisan?.profiles?.full_name || c.client?.full_name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
