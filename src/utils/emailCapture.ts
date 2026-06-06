import { supabase } from "@/integrations/supabase/client";

export type EmailCaptureSource =
  | "pdf_download"
  | "json_download"
  | "phase_5_email_only"
  | "hero"
  | "other";

interface CaptureOpts {
  email: string;
  projectId?: string | null;
  source: EmailCaptureSource;
  language: "es" | "en";
}

export async function captureEmailLead({
  email,
  projectId,
  source,
  language,
}: CaptureOpts): Promise<{ ok: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Invalid email format" };
  }

  const { error } = await supabase.from("email_leads").insert({
    email: trimmed,
    project_id: projectId || null,
    source,
    language,
  });

  if (error) {
    console.error("Failed to capture email lead:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
