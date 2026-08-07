-- Missions app — initial schema
-- Single owner (the app user) + one read-only shareable link for their spouse.

create extension if not exists pgcrypto;

create type mission_status as enum ('possible', 'probable', 'confirmed', 'cancelled');

-- ---------------------------------------------------------------------------
-- missions
-- ---------------------------------------------------------------------------
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  destination text not null check (char_length(trim(destination)) > 0),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  -- true when the dates are a best guess ("fin octobre", "semaine du 14 septembre")
  is_approximate boolean not null default false,
  -- human-readable label shown instead of exact dates when is_approximate = true,
  -- e.g. "Semaine du 14 septembre", "Fin octobre"
  approx_label text,
  status mission_status not null default 'possible',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists missions_owner_start_idx
  on public.missions (owner_id, start_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists missions_set_updated_at on public.missions;
create trigger missions_set_updated_at
  before update on public.missions
  for each row
  execute function public.set_updated_at();

alter table public.missions enable row level security;

-- Owner has full read/write access to their own missions.
-- No policy exists for the anon role, so direct table access from the
-- public share page is denied by default (it must go through the
-- get_shared_missions() function below instead).
create policy "owner can read own missions"
  on public.missions for select
  using (auth.uid() = owner_id);

create policy "owner can insert own missions"
  on public.missions for insert
  with check (auth.uid() = owner_id);

create policy "owner can update own missions"
  on public.missions for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owner can delete own missions"
  on public.missions for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- share_links — one active token per owner. Regenerating overwrites the
-- token, which immediately invalidates any previously issued link.
-- ---------------------------------------------------------------------------
create table if not exists public.share_links (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.share_links enable row level security;

create policy "owner can read own share link"
  on public.share_links for select
  using (auth.uid() = owner_id);

create policy "owner can insert own share link"
  on public.share_links for insert
  with check (auth.uid() = owner_id);

create policy "owner can update own share link"
  on public.share_links for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- get_shared_missions(token) — the ONLY way the public /share/[token] page
-- reads data. SECURITY DEFINER lets it bypass RLS internally, but it only
-- ever returns the narrow, non-sensitive columns needed for the read-only
-- view (no owner_id, no note, no ids beyond what's needed for a React key).
-- A non-matching or revoked token returns zero rows.
-- ---------------------------------------------------------------------------
create or replace function public.get_shared_missions(p_token text)
returns table (
  id uuid,
  destination text,
  start_date date,
  end_date date,
  is_approximate boolean,
  approx_label text,
  status mission_status
)
language sql
security definer
set search_path = public
stable
as $$
  select m.id, m.destination, m.start_date, m.end_date,
         m.is_approximate, m.approx_label, m.status
  from public.missions m
  join public.share_links sl on sl.owner_id = m.owner_id
  where sl.token = p_token
    and m.status <> 'cancelled'
  order by m.start_date asc;
$$;

revoke all on function public.get_shared_missions(text) from public;
grant execute on function public.get_shared_missions(text) to anon, authenticated;
