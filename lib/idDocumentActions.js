"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function uploadIdDocument(formData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const documentType = formData.get("documentType");
  const documentNumber = formData.get("documentNumber");
  const file = formData.get("idDocument");
  const returnTo = formData.get("returnTo") || "/dashboard";

  if (!documentType) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=Choisis+un+type+de+pièce`);
  }
  if (!documentNumber?.trim()) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=Renseigne+le+numéro+de+la+pièce`);
  }
  if (!file || typeof file === "string" || file.size === 0) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=Aucun+fichier+sélectionné`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/piece-identite.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("id-documents")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(uploadError.message)}`);
  }

  // Le bucket est privé : on stocke le chemin, pas une URL publique.
  // Une URL signée temporaire est générée au moment de l'affichage.
  await supabase
    .from("profiles")
    .update({
      id_document_type: documentType,
      id_document_number: documentNumber.trim(),
      id_document_url: path,
      id_document_uploaded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  redirect(returnTo);
}
