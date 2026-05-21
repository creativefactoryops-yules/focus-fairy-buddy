ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS character_type text NOT NULL DEFAULT 'girl',
  ADD COLUMN IF NOT EXISTS room_layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS intro_seen boolean NOT NULL DEFAULT false;