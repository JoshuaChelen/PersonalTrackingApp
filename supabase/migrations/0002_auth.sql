-- Progress Tracker — lock the data behind a login.
--
-- v1 (0001_init.sql) granted the anon role full access. This migration replaces
-- those policies with authenticated-only ones. This is a SINGLE-ACCOUNT app:
-- disable public sign-ups in the Supabase dashboard (Authentication -> Providers
-- -> Email -> turn off "Enable sign ups") and create your one account manually,
-- so "any authenticated user" == you. No user_id column is needed.
--
-- To add true multi-user later: add a `user_id uuid default auth.uid()` column to
-- each table and change `using (true)` to `using (auth.uid() = user_id)`.

do $$
declare t text;
begin
  foreach t in array array[
    'muscle_groups','muscles','exercises','exercise_muscles','workouts','workout_sets'
  ] loop
    -- Drop the old public policy.
    execute format('drop policy if exists anon_all on public.%1$s;', t);
    -- Recreate the authenticated policy idempotently.
    execute format('drop policy if exists authenticated_all on public.%1$s;', t);
    execute format(
      'create policy authenticated_all on public.%1$s
         for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
