-- Progress Tracker — gym module schema.
-- Designed for Legend-State offline-first sync: every table has
-- created_at / updated_at / deleted for change tracking + soft deletes.

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at current on every UPDATE (server-authoritative time
-- so Legend-State's "changes since last sync" is reliable).
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.muscle_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists public.muscles (
  id uuid primary key default gen_random_uuid(),
  muscle_group_id uuid not null references public.muscle_groups (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  equipment text,
  notes text,
  is_custom boolean not null default false,
  target_rep_min integer not null default 7,
  target_rep_max integer not null default 10,
  weight_increment numeric not null default 5,
  unit text not null default 'lb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists public.exercise_muscles (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  muscle_id uuid not null references public.muscles (id) on delete cascade,
  role text not null check (role in ('primary', 'secondary')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  set_index integer not null default 0,
  weight numeric not null,
  reps integer not null,
  rpe numeric,
  is_warmup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

-- Helpful indexes for the queries the app runs.
create index if not exists idx_muscles_group on public.muscles (muscle_group_id);
create index if not exists idx_exmuscles_exercise on public.exercise_muscles (exercise_id);
create index if not exists idx_sets_workout on public.workout_sets (workout_id);
create index if not exists idx_sets_exercise on public.workout_sets (exercise_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'muscle_groups','muscles','exercises','exercise_muscles','workouts','workout_sets'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- This baseline grants the anon role full access (no auth). Migration
-- 0002_auth.sql REPLACES these with authenticated-only policies — run it too if
-- you want the app gated behind a login (recommended). Run migrations in order.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'muscle_groups','muscles','exercises','exercise_muscles','workouts','workout_sets'
  ] loop
    execute format('alter table public.%1$s enable row level security;', t);
    execute format('drop policy if exists anon_all on public.%1$s;', t);
    execute format(
      'create policy anon_all on public.%1$s
         for all to anon using (true) with check (true);', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime: broadcast changes so other devices sync live.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'muscle_groups','muscles','exercises','exercise_muscles','workouts','workout_sets'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%1$s;', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
