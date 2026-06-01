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
-- Generated as roles × locations: each role has base junior/mid/senior bands
-- at the national baseline, scaled by a per-location multiplier and rounded to
-- the nearest RM 50. This mirrors the generation logic in src/lib/salary.ts.
-- These figures are illustrative; replace with your own sourced data.
-- ----------------------------------------------------------------------------
with roles(role, jmin, jmax, mmin, mmax, smin, smax) as (
  values
    ('Software Engineer',            3500, 6000, 6000, 11000, 11000, 20000),
    ('Frontend Developer',           3300, 5800, 5800, 10000, 10000, 18000),
    ('Backend Developer',            3600, 6200, 6200, 11500, 11500, 21000),
    ('Mobile Developer',             3500, 6000, 6000, 11000, 11000, 19000),
    ('DevOps Engineer',              4500, 7000, 7000, 13000, 13000, 23000),
    ('QA Engineer',                  3000, 5000, 5000, 8500,  8500,  15000),
    ('Cybersecurity Analyst',        4000, 6500, 6500, 12000, 12000, 22000),
    ('Data Scientist',               4000, 6500, 6500, 12000, 12000, 22000),
    ('Data Analyst',                 3200, 5200, 5200, 9000,  9000,  15000),
    ('Data Engineer',                4200, 6800, 6800, 12500, 12500, 22000),
    ('Machine Learning Engineer',    4500, 7500, 7500, 14000, 14000, 25000),
    ('Product Manager',              5000, 8000, 8000, 15000, 15000, 28000),
    ('UX Designer',                  3500, 5500, 5500, 9500,  9500,  16000),
    ('UI Designer',                  3300, 5200, 5200, 9000,  9000,  15000),
    ('Graphic Designer',             2800, 4200, 4200, 7000,  7000,  12000),
    ('Digital Marketing Executive',  2800, 4200, 4200, 7500,  7500,  13000),
    ('Content Writer',               2600, 4000, 4000, 6500,  6500,  11000),
    ('SEO Specialist',               3000, 4800, 4800, 8000,  8000,  14000),
    ('Sales Executive',              2800, 4500, 4500, 8000,  8000,  16000),
    ('Accountant',                   3000, 4500, 4500, 8000,  8000,  15000),
    ('Financial Analyst',            3500, 5500, 5500, 9500,  9500,  17000),
    ('Human Resources Executive',    2800, 4500, 4500, 7500,  7500,  13000),
    ('Business Analyst',             3800, 6000, 6000, 10500, 10500, 18000),
    ('Project Manager',              4500, 7000, 7000, 12500, 12500, 22000)
),
locs(location, mult) as (
  values
    ('Malaysia',      1.00),
    ('Kuala Lumpur',  1.12),
    ('Selangor',      1.06),
    ('Penang',        0.98),
    ('Johor Bahru',   0.95),
    ('Remote',        1.08)
),
levels(level) as (
  values ('junior'::experience_level), ('mid'::experience_level), ('senior'::experience_level)
),
seed as (
  select
    r.role,
    l.location,
    lv.level,
    (round(
      (case lv.level
        when 'junior' then r.jmin
        when 'mid'    then r.mmin
        else               r.smin
      end) * l.mult / 50.0) * 50)::int as salary_min,
    (round(
      (case lv.level
        when 'junior' then r.jmax
        when 'mid'    then r.mmax
        else               r.smax
      end) * l.mult / 50.0) * 50)::int as salary_max
  from roles r
  cross join locs l
  cross join levels lv
)
insert into public.salaries (role, location, experience_level, salary_min, salary_max, source)
select role, location, level, salary_min, salary_max, 'SalaryMY market sample'
from seed
on conflict (lower(role), lower(location), experience_level) do update
  set salary_min = excluded.salary_min,
      salary_max = excluded.salary_max,
      source     = excluded.source;
