import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "../actions";
import { redirect } from "next/navigation";

export default async function ConversationPage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-[70vh] flex-col">
      <h1 className="mb-4 text-xl font-bold text-brand-dark">Conversation</h1>

      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
        {!messages || messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun message. Écris le premier !
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-xs rounded-lg p-3 text-sm ${
                  m.sender_id === user.id
                    ? "ml-auto bg-brand text-white"
                    : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <form action={sendMessage} className="mt-4 flex gap-2">
        <input type="hidden" name="conversationId" value={id} />
        <input
          name="content"
          required
          placeholder="Écris ton message..."
          className="flex-1 rounded-lg border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
