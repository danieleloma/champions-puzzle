-- Arsenal Puzzle — Initial Schema
-- Run in Supabase SQL editor or via CLI: supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default uuid_generate_v4(),
  device_id     text not null unique,
  username      text not null unique,
  xp            integer not null default 0,
  avatar_color  text not null default '#EF0107',
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create index idx_users_device_id on users(device_id);
create index idx_users_username on users(username);

-- ─── PUZZLES ──────────────────────────────────────────────────────────────────
create table puzzles (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  description    text,
  image_url      text not null,
  thumbnail_url  text,
  difficulty     text not null check (difficulty in ('beginner','easy','medium','hard','expert','legendary')),
  tile_count     integer generated always as (
    case difficulty
      when 'beginner'  then 9
      when 'easy'      then 16
      when 'medium'    then 25
      when 'hard'      then 36
      when 'expert'    then 64
      when 'legendary' then 100
    end
  ) stored,
  active         boolean not null default false,
  featured       boolean not null default false,
  play_count     integer not null default 0,
  created_at     timestamptz not null default now()
);

create index idx_puzzles_active on puzzles(active, featured);

-- ─── PUZZLE ATTEMPTS ──────────────────────────────────────────────────────────
create table puzzle_attempts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  puzzle_id           uuid not null references puzzles(id) on delete cascade,
  difficulty          text not null,
  completion_time_ms  integer not null,
  move_count          integer not null,
  hints_used          integer not null default 0,
  completed           boolean not null default false,
  score               integer not null default 0,
  created_at          timestamptz not null default now()
);

create index idx_attempts_user on puzzle_attempts(user_id);
create index idx_attempts_puzzle on puzzle_attempts(puzzle_id);

-- ─── LEADERBOARD ENTRIES ──────────────────────────────────────────────────────
create table leaderboard_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  puzzle_id     uuid not null references puzzles(id) on delete cascade,
  difficulty    text not null,
  best_time_ms  integer not null,
  score         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, puzzle_id, difficulty)
);

create index idx_leaderboard_puzzle on leaderboard_entries(puzzle_id, difficulty, best_time_ms);
create index idx_leaderboard_updated on leaderboard_entries(updated_at);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leaderboard_updated_at
  before update on leaderboard_entries
  for each row execute function update_updated_at();

-- ─── XP INCREMENT FUNCTION ────────────────────────────────────────────────────
create or replace function increment_xp(user_id uuid, amount integer)
returns integer language plpgsql as $$
declare
  new_xp integer;
begin
  update users set xp = xp + amount, last_seen_at = now()
  where id = user_id
  returning xp into new_xp;
  return new_xp;
end;
$$;

-- ─── PLAY COUNT TRIGGER ───────────────────────────────────────────────────────
create or replace function increment_play_count()
returns trigger language plpgsql as $$
begin
  update puzzles set play_count = play_count + 1 where id = new.puzzle_id;
  return new;
end;
$$;

create trigger on_attempt_created
  after insert on puzzle_attempts
  for each row execute function increment_play_count();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table users enable row level security;
alter table puzzles enable row level security;
alter table puzzle_attempts enable row level security;
alter table leaderboard_entries enable row level security;

-- Public read for puzzles and leaderboard
create policy "public_read_puzzles" on puzzles for select using (active = true);
create policy "public_read_leaderboard" on leaderboard_entries for select using (true);
create policy "public_read_users" on users for select using (true);

-- Service role has full access (used by API routes)
-- No additional policies needed — service key bypasses RLS

-- ─── STORAGE ──────────────────────────────────────────────────────────────────
-- Create in Supabase dashboard: Storage → New bucket → "puzzle-images" → Public
-- Or via CLI:
-- supabase storage create puzzle-images --public
