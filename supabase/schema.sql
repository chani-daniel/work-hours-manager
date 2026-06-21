-- Work Hours Manager — database schema (TASK-003)
-- Three tables, each isolated per user via Row-Level Security (user_id = auth.uid()).
-- Run this in the Supabase SQL Editor. Safe to re-run after a reset.

-- ========================= months =========================
-- One monthly plan (target hours) per user per month.
create table public.months (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid()
                   references auth.users (id) on delete cascade,
  year           int not null,
  month          int not null check (month between 1 and 12),
  monthly_target numeric not null check (monthly_target >= 0),
  created_at     timestamptz not null default now(),
  unique (user_id, year, month)
);

-- ======================= day_records ======================
-- One record per calendar day (EC-3 enforced by the unique constraint).
create table public.day_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                  references auth.users (id) on delete cascade,
  date          date not null,
  day_type      text not null default 'working'
                  check (day_type in ('working','weekend','holiday','vacation_full','vacation_half')),
  entry_method  text not null default 'none'
                  check (entry_method in ('range','direct','none')),
  start_time    time,
  end_time      time,
  direct_hours  numeric check (direct_hours is null or direct_hours >= 0),
  break_overage numeric not null default 0 check (break_overage >= 0),
  net_hours     numeric not null default 0 check (net_hours >= 0),
  created_at    timestamptz not null default now(),
  unique (user_id, date)
);

-- ========================= settings =======================
-- Per-user thresholds. Defaults from PLAN §3.3.
create table public.settings (
  user_id               uuid primary key default auth.uid()
                          references auth.users (id) on delete cascade,
  max_daily_hours       numeric not null default 12,
  max_consecutive_days  int     not null default 6,
  lag_factor            numeric not null default 1.25,
  green_factor          numeric not null default 1.0,
  yellow_factor         numeric not null default 0.75
);

-- ==================== Row-Level Security ===================
-- Enable RLS, then allow each user full access to ONLY her own rows.
alter table public.months      enable row level security;
alter table public.day_records enable row level security;
alter table public.settings    enable row level security;

create policy "Users manage their own months"
  on public.months for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own day_records"
  on public.day_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own settings"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
