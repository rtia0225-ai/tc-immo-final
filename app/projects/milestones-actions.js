"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addMilestone(formData) {
  const supabase = createClient();
  const projectId = formData.get("projectId");
  const title = formData.get("title");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !title?.trim()) return;

  // Seul l'artisan du projet peut ajouter une étape (contrôlé aussi par la RLS)
  await supabase.from("project_milestones").insert({
    project_id: projectId,
    title: title.trim(),
  });

  redirect(`/projects/${projectId}`);
}

// L'artisan coche/décoche une étape terminée
export async function toggleMilestone(formData) {
  const supabase = createClient();
  const milestoneId = formData.get("milestoneId");
  const projectId = formData.get("projectId");
  const isCompleted = formData.get("isCompleted") === "true";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("project_milestones")
    .update({
      is_completed: !isCompleted,
      completed_at: !isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId);

  redirect(`/projects/${projectId}`);
}
