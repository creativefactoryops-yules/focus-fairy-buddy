import { supabase } from "@/integrations/supabase/client";

export type EventType =
  | "signup"
  | "session_start"
  | "session_complete"
  | "break_taken"
  | "phone_call"
  | "phone_sms"
  | "theme_change"
  | "item_dragged"
  | "onboarding_complete"
  | "feature_use";

export async function track(event_type: EventType, event_data: Record<string, any> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      user_id: user?.id ?? null,
      event_type,
      event_data,
    });
  } catch {
    // never block UX on analytics
  }
}
