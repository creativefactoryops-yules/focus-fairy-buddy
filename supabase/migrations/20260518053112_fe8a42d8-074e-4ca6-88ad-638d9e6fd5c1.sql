create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  hair_color text not null default '#2d1b69',
  skin_color text not null default '#f5c5a3',
  outfit_color text,
  cat_fur_color text not null default '#d4a0d4',
  cat_breed text not null default 'persian',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();