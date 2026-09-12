import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminArtisansPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) redirect("/dashboard");

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select(
      `id, trade, is_verified, created_at,
       profiles ( full_name, phone, city, avatar_url, id_document_url, created_at )`
    )
    .order("id", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold text-ink">
        Artisans inscrits ({artisans?.length || 0})
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Triés du plus récent au plus ancien — les nouvelles inscriptions apparaissent en haut.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {artisans?.map((a) => (
          <Link
            key={a.id}
            href={`/admin/artisans/${a.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              {a.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-300">
                  {a.profiles?.full_name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-ink">{a.profiles?.full_name}</p>
                <p className="text-xs text-gray-500">{a.trade} · {a.profiles?.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!a.profiles?.id_document_url && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  Pas de pièce d'identité
                </span>
              )}
              {a.is_verified ? (
                <span className="rounded-full bg-forest-light px-2 py-0.5 text-[10px] font-bold text-forest">
                  Vérifié
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                  Non vérifié
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
