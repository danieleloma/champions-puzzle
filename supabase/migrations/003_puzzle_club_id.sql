-- Link puzzles to a club so /club/[clubId] can show only that club's puzzles.
-- Run after migration 001. Club ids must match lib/champions-data.ts CHAMPIONS[].id.

alter table puzzles
  add column club_id text not null default 'arsenal'
  check (club_id in ('arsenal', 'barcelona', 'inter', 'bayern', 'psg'));

alter table puzzles alter column club_id drop default;

create index idx_puzzles_club on puzzles(club_id, active, featured);
