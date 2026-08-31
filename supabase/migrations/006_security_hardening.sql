-- Pre-launch security hardening. Run after migration 005.
--
-- 1. `public_read_users` granted anon SELECT on the full `users` table with
--    no column restriction — since `device_id` doubles as this app's only
--    write credential (any device can POST /api/puzzle-sessions or
--    /api/scores as any device_id it knows), this let anyone holding the
--    public anon key dump every device_id/username/xp and then impersonate
--    any player. No client code actually reads this table directly (the
--    leaderboard and user lookups all go through service-role API routes),
--    so the policy served no legitimate purpose. Drop it.
drop policy if exists "public_read_users" on users;

-- 2. `service_upload_puzzle_images` had no `to` clause, so despite its name
--    and comment it actually applied to PUBLIC (including anon) — letting
--    anyone with the anon key upload arbitrary files to the public bucket
--    without the admin secret. Service-role calls bypass RLS entirely and
--    never needed this policy; scope it to service_role explicitly so it's
--    a no-op for anon/authenticated.
drop policy if exists "service_upload_puzzle_images" on storage.objects;

create policy "service_upload_puzzle_images"
  on storage.objects for insert
  to service_role
  with check ( bucket_id = 'puzzle-images' );

-- 3. Session tokens were stateless and never marked consumed, so a single
--    valid POST /api/scores request could be replayed indefinitely to farm
--    unlimited XP/leaderboard credit. Tying each attempt to the session
--    token it was submitted with, under a uniqueness constraint, makes a
--    second submission for the same session fail at the database rather
--    than silently re-awarding credit. Nullable + a partial index (rather
--    than `unique not null`) so historical rows with no session_token don't
--    collide with each other.
alter table puzzle_attempts add column session_token text;
create unique index idx_attempts_session_token
  on puzzle_attempts(session_token)
  where session_token is not null;
