-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable Postgres CDC for the leaderboard so connected clients get live updates.
-- Run this in the Supabase SQL editor after migration 001.

alter publication supabase_realtime add table leaderboard_entries;

-- ─── STORAGE POLICY ───────────────────────────────────────────────────────────
-- The "puzzle-images" bucket must be created in the Supabase dashboard first:
--   Storage → New bucket → Name: puzzle-images → Public: ON → Save
--
-- Once the bucket exists, run these policies:

insert into storage.buckets (id, name, public)
values ('puzzle-images', 'puzzle-images', true)
on conflict (id) do nothing;

-- Allow public read of all images
create policy "public_read_puzzle_images"
  on storage.objects for select
  using ( bucket_id = 'puzzle-images' );

-- Allow service role to upload (API routes use service key)
create policy "service_upload_puzzle_images"
  on storage.objects for insert
  with check ( bucket_id = 'puzzle-images' );
