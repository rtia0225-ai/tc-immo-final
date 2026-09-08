import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RevenusPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artisan") {
    redirect("/dashboard");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, amount, currency, status")
    .eq("artisan_id", user.id)
    .order("created_at", { ascending: false });

  const released = (projects || []).filter((p) => p.status === "released");
  const pending = (projects || []).filter(
    (p) => p.status !== "released" && p.status !== "cancelled"
  );

  const totalReleased = released.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const currency = projects?.[0]?.currency || "XOF";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        Mes revenus
      </h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-light bg-white p-5">
          <p className="text-sm text-gray-500">Total perçu</p>
          <p className="text-2xl font-bold text-brand-dark">
            {totalReleased.toLocaleString("fr-FR")} {currency}
          </p>
        </div>
        <div className="rounded-xl border border-brand-light bg-white p-5">
          <p className="text-sm text-gray-500">
            En attente (projets en cours)
          </p>
          <p className="text-2xl font-bold text-gray-600">
            {totalPending.toLocaleString("fr-FR")} {currency}
          </p>
        </div>
      </div>

      <h2 className="mb-3 font-semibold">Détail par projet</h2>
      {!projects || projects.length === 0 ? (
        <p className="text-gray-600">Aucun projet pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-brand-light bg-white p-4"
            >
              <span>{p.title}</span>
              <span className="text-sm text-gray-500">
                {p.amount} {p.currency} — {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
