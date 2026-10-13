-- Run AFTER schema.sql, and AFTER you created your login in
-- Supabase → Authentication → Users → "Add user" (tick "Auto Confirm User").
-- Replace the email and name below with yours, then Run.

insert into public.users (user_id, name, email, role_id, department_id, is_active)
select au.id,
       'System Administrator',              -- ← your name
       au.email,
       (select role_id from public.roles where role_name = 'System Admin'),
       null,
       true
from auth.users au
where au.email = 'admin@example.com'         -- ← your email
on conflict (user_id) do update
  set role_id = excluded.role_id, is_active = true;
