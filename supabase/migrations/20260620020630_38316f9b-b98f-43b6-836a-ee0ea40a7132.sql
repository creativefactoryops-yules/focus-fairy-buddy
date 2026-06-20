
-- 1. Bootstrap admin emails table (replaces hardcoded email)
CREATE TABLE IF NOT EXISTS public.admin_bootstrap_emails (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_bootstrap_emails TO service_role;
ALTER TABLE public.admin_bootstrap_emails ENABLE ROW LEVEL SECURITY;
-- No policies => no client access; only service_role / SECURITY DEFINER functions can read.

INSERT INTO public.admin_bootstrap_emails (email)
VALUES (lower('Creativefactory.ops@gmail.com'))
ON CONFLICT DO NOTHING;

-- 2. Replace handle_new_user to use bootstrap table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.admin_bootstrap_emails WHERE email = lower(NEW.email)) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  INSERT INTO public.analytics_events (user_id, event_type, event_data)
  VALUES (NEW.id, 'signup', jsonb_build_object('email_domain', split_part(NEW.email, '@', 2)));

  RETURN NEW;
END;
$function$;

-- 3. Lock down user_roles writes (no client INSERT/UPDATE/DELETE)
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "No client writes to user_roles" ON public.user_roles;
CREATE POLICY "No client inserts on user_roles" ON public.user_roles
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client updates on user_roles" ON public.user_roles
  FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on user_roles" ON public.user_roles
  FOR DELETE TO authenticated, anon USING (false);

-- 4. Tighten analytics_events insert policy (no spoofing user_id)
DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;
CREATE POLICY "Insert events for self or anon" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- 5. Revoke public execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
