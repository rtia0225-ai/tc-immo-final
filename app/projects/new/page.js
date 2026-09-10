import { createProject } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { uploadIdDocument } from "@/lib/idDocumentActions";
import MilestoneBuilder from "@/components/MilestoneBuilder";

export default async function NewProjectPage({ searchParams }) {
  const artisanId = searchParams?.artisan;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentPath = `/projects/new?artisan=${artisanId}`;
  if (!user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_document_url, role")
    .eq("id", user.id)
    .single();

  // Seul un client peut démarrer un projet — pas l'artisan.
  if (profile?.role === "artisan") {
    redirect("/dashboard");
  }

  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select("id, trade, currency, profiles ( full_name )")
    .eq("id", artisanId)
    .single();

  // Pièce d'identité obligatoire avant de démarrer un projet — pas avant,
  // le client reste libre de naviguer/discuter sans la fournir.
  if (!profile?.id_document_url) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-heading text-2xl font-bold">Vérification d'identité requise</h1>
        <p className="mt-3 text-sm text-gray-600">
          Avant de démarrer un projet et d'engager un paiement séquestré, nous avons besoin d'une pièce d'identité de ta part. C'est une étape ponctuelle, à faire une seule fois.
        </p>

        {searchParams?.error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{searchParams.error}</p>
        )}

        <form action={uploadIdDocument} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="returnTo" value={currentPath} />
          <input
            type="file"
            name="idDocument"
            accept="image/*,.pdf"
            required
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
          <p className="text-xs text-gray-500">
            Carte nationale d'identité, passeport ou équivalent. Jamais visible par l'artisan.
          </p>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand py-3 font-heading font-bold text-white hover:bg-brand-dark"
          >
            Envoyer et continuer
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-heading text-2xl font-bold">Sécurisez vos travaux</h1>
      {artisan && (
        <p className="mt-1 text-sm text-gray-500">
          Contrat avec {artisan.profiles?.full_name} ({artisan.trade})
        </p>
      )}
      <p className="mt-3 text-sm text-gray-500">
        Renseigne les termes convenus avec l'artisan (après devis), y compris
        l'échéancier de paiement par étape. Le paiement reste séquestré et
        n'est libéré, étape par étape, qu'après validation par l'artisan.
      </p>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{searchParams.error}</p>
      )}

      <form action={createProject} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="artisanId" value={artisanId} />
        <input type="hidden" name="currency" value={artisan?.currency || "XOF"} />

        <div>
          <label className="mb-1 block text-sm font-medium">Titre du projet</label>
          <input
            name="title"
            required
            placeholder="ex: Villa R+1 — Cocody, Abidjan"
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Détails convenus dans le devis"
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Montant total convenu ({artisan?.currency || "XOF"})
          </label>
          <input
            type="number"
            name="amount"
            required
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <MilestoneBuilder />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-brand py-3 font-heading font-bold text-white hover:bg-brand-dark"
        >
          Valider et créer le projet
        </button>
      </form>
    </div>
  );
}
