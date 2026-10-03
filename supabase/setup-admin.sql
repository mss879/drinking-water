-- =============================================================================
-- LUSAKO · Give a Supabase user access to /admin
-- -----------------------------------------------------------------------------
-- Run this after the seven migrations, once the user exists:
--   Authentication → Users → Add user → email + password, tick "Auto Confirm User".
-- Then replace the email below and run this in the SQL editor. Run it again with
-- another email to add more admins.
--
-- To remove someone:  delete from public.admin_users where email = 'their@email';
-- =============================================================================

insert into public.admin_users (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = lower('you@example.com')   -- ◀ replace with the admin's email
on conflict (user_id) do update set email = excluded.email
returning email as "Admin added";
