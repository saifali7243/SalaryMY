-- ============================================================================
-- SalaryMY — Supabase schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- or via the Supabase CLI:  supabase db push
-- It is safe to re-run: objects are created with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUM: experience level
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'experience_level') then
    create type experience_level as enum ('junior', 'mid', 'senior');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- TABLE: salaries  (curated / aggregated market data shown publicly)
-- ----------------------------------------------------------------------------
create table if not exists public.salaries (
  id               uuid primary key default gen_random_uuid(),
  role             text not null,
  location         text not null default 'Malaysia',
  experience_level experience_level not null,
  salary_min       integer not null check (salary_min >= 0),
  salary_max       integer not null check (salary_max >= salary_min),
  source           text,
  created_at       timestamptz not null default now()
);

-- A role+location+level combination should be unique so we can upsert cleanly.
create unique index if not exists salaries_role_location_level_idx
  on public.salaries (lower(role), lower(location), experience_level);

create index if not exists salaries_role_idx on public.salaries (lower(role));
create index if not exists salaries_location_idx on public.salaries (lower(location));

-- ----------------------------------------------------------------------------
-- TABLE: user_submissions  (crowdsourced salary reports from visitors)
-- ----------------------------------------------------------------------------
create table if not exists public.user_submissions (
  id               uuid primary key default gen_random_uuid(),
  company          text not null,
  role             text not null,
  salary           integer not null check (salary >= 0),
  experience_years integer not null check (experience_years >= 0 and experience_years <= 60),
  location         text not null,
  approved         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists user_submissions_role_idx on public.user_submissions (lower(role));
create index if not exists user_submissions_created_at_idx on public.user_submissions (created_at desc);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.salaries enable row level security;
alter table public.user_submissions enable row level security;

-- salaries: world-readable, no public writes (managed by service role only).
drop policy if exists "salaries are readable by everyone" on public.salaries;
create policy "salaries are readable by everyone"
  on public.salaries for select
  using (true);

-- user_submissions: anyone may INSERT a report (anon key), but cannot read
-- other people's raw submissions. Only approved rows could be exposed via a view.
drop policy if exists "anyone can submit a salary report" on public.user_submissions;
create policy "anyone can submit a salary report"
  on public.user_submissions for insert
  with check (true);

drop policy if exists "approved submissions are readable" on public.user_submissions;
create policy "approved submissions are readable"
  on public.user_submissions for select
  using (approved = true);

-- ----------------------------------------------------------------------------
-- SEED DATA — sample Malaysian market salaries (monthly, MYR)
-- These figures are illustrative starting data; replace with your own sources.
-- ----------------------------------------------------------------------------
insert into public.salaries (role, location, experience_level, salary_min, salary_max, source) values
  ('Software Engineer',     'Malaysia', 'junior', 3500,  6000,  'SalaryMY market sample'),
  ('Software Engineer',     'Malaysia', 'mid',    6000,  11000, 'SalaryMY market sample'),
  ('Software Engineer',     'Malaysia', 'senior', 11000, 20000, 'SalaryMY market sample'),
  ('Data Scientist',        'Malaysia', 'junior', 4000,  6500,  'SalaryMY market sample'),
  ('Data Scientist',        'Malaysia', 'mid',    6500,  12000, 'SalaryMY market sample'),
  ('Data Scientist',        'Malaysia', 'senior', 12000, 22000, 'SalaryMY market sample'),
  ('Product Manager',       'Malaysia', 'junior', 5000,  8000,  'SalaryMY market sample'),
  ('Product Manager',       'Malaysia', 'mid',    8000,  15000, 'SalaryMY market sample'),
  ('Product Manager',       'Malaysia', 'senior', 15000, 28000, 'SalaryMY market sample'),
  ('UX Designer',           'Malaysia', 'junior', 3500,  5500,  'SalaryMY market sample'),
  ('UX Designer',           'Malaysia', 'mid',    5500,  9500,  'SalaryMY market sample'),
  ('UX Designer',           'Malaysia', 'senior', 9500,  16000, 'SalaryMY market sample'),
  ('DevOps Engineer',       'Malaysia', 'junior', 4500,  7000,  'SalaryMY market sample'),
  ('DevOps Engineer',       'Malaysia', 'mid',    7000,  13000, 'SalaryMY market sample'),
  ('DevOps Engineer',       'Malaysia', 'senior', 13000, 23000, 'SalaryMY market sample'),
  ('Accountant',            'Malaysia', 'junior', 3000,  4500,  'SalaryMY market sample'),
  ('Accountant',            'Malaysia', 'mid',    4500,  8000,  'SalaryMY market sample'),
  ('Accountant',            'Malaysia', 'senior', 8000,  15000, 'SalaryMY market sample'),
  ('Digital Marketing Executive', 'Malaysia', 'junior', 2800, 4200, 'SalaryMY market sample'),
  ('Digital Marketing Executive', 'Malaysia', 'mid',    4200, 7500, 'SalaryMY market sample'),
  ('Digital Marketing Executive', 'Malaysia', 'senior', 7500, 13000,'SalaryMY market sample')
on conflict (lower(role), lower(location), experience_level) do update
  set salary_min = excluded.salary_min,
      salary_max = excluded.salary_max,
      source     = excluded.source;
