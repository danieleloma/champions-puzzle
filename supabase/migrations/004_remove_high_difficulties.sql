-- Retire hard / expert / legendary difficulty tiers — only
-- beginner / easy / medium remain. No existing puzzle rows use the
-- removed tiers, so this is a straight constraint tightening.

alter table puzzles drop constraint puzzles_difficulty_check;
alter table puzzles add constraint puzzles_difficulty_check
  check (difficulty in ('beginner','easy','medium'));

alter table puzzles drop column tile_count;
alter table puzzles add column tile_count integer generated always as (
  case difficulty
    when 'beginner' then 9
    when 'easy'     then 16
    when 'medium'   then 25
  end
) stored;
