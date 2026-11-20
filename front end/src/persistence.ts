import type { Profile } from "./store";
import { supabase } from "./supabase";

const CV_BUCKET = "virage-cvs";

function getClient() {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
}

export async function loadProfile(userId: string) {
  const { data, error } = await getClient()
    .from("virage_profiles")
    .select("app_state, cv_path")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as { app_state: Profile; cv_path: string | null } | null;
}

export async function saveProfile(userId: string, profile: Profile) {
  const { error } = await getClient().from("virage_profiles").upsert({
    user_id: userId,
    app_state: profile,
    cv_path: profile.cvStoragePath || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function uploadCv(userId: string, file: File) {
  const path = `${userId}/cv`;
  const { error } = await getClient()
    .storage.from(CV_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType:
        file.type ||
        (file.name.toLowerCase().endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf"),
    });
  if (error) throw error;
  return path;
}

export async function downloadCv(path: string) {
  const { data, error } = await getClient().storage.from(CV_BUCKET).download(path);
  if (error) throw error;
  return data;
}

export async function deleteCv(path: string) {
  const { error } = await getClient().storage.from(CV_BUCKET).remove([path]);
  if (error) throw error;
}
