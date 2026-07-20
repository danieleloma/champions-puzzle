-- Add "spain" (World Cup champions) to the set of valid puzzle club_ids.
-- See lib/champions-data.ts CHAMPIONS[] — must stay in sync with this list.

alter table puzzles drop constraint puzzles_club_id_check;

alter table puzzles
  add constraint puzzles_club_id_check
  check (club_id in ('arsenal', 'barcelona', 'inter', 'bayern', 'psg', 'spain'));
