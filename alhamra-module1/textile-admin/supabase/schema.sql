-- =====================================================================
-- Al-Hamra Textile — Integrated Textile Management & Analytics Platform
-- MODULE 1: System Administration & Configuration
-- Run this whole file once in Supabase → SQL Editor → New query → Run
-- =====================================================================

-- ---------- ROLES ----------
create table if not exists public.roles (
  role_id      serial primary key,
  role_name    text not null unique,
  description  text
);

-- ---------- PERMISSIONS (RBAC matrix from SRS §5) ----------
create table if not exists public.permissions (
  permission_id serial primary key,
  code          text not null unique,
  label         text not null,
  sort_order    int  not null default 0
);

create table if not exists public.role_permissions (
  role_id       int  not null references public.roles(role_id) on delete cascade,
  permission_id int  not null references public.permissions(permission_id) on delete cascade,
  access        text not null check (access in ('YES','LIMITED')),
  primary key (role_id, permission_id)
);

-- ---------- DEPARTMENTS ----------
create table if not exists public.departments (
  department_id   serial primary key,
  department_name text not null unique,
  description     text,
  created_at      timestamptz not null default now()
);

-- ---------- PRODUCTION STAGES (with processing targets) ----------
create table if not exists public.production_stages (
  stage_id            serial primary key,
  stage_name          text not null unique,
  stage_sequence      int  not null unique check (stage_sequence > 0),
  department_id       int  references public.departments(department_id) on delete set null,
  target_duration_hrs numeric(6,2) not null check (target_duration_hrs > 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------- USERS (profile linked to Supabase Auth; password is stored hashed by Supabase Auth) ----------
create table if not exists public.users (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  role_id       int  not null references public.roles(role_id),
  department_id int  references public.departments(department_id) on delete set null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role_id);
create index if not exists users_dept_idx on public.users(department_id);

-- ---------- HELPER: is the current user an active System Admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid()
      and u.is_active
      and r.role_name = 'System Admin'
  );
$$;

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists stages_touch on public.production_stages;
create trigger stages_touch before update on public.production_stages
  for each row execute function public.touch_updated_at();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.roles             enable row level security;
alter table public.permissions       enable row level security;
alter table public.role_permissions  enable row level security;
alter table public.departments       enable row level security;
alter table public.production_stages enable row level security;
alter table public.users             enable row level security;

-- Every signed-in user can read reference data; only admins can change it.
do $$
declare t text;
begin
  foreach t in array array['roles','permissions','role_permissions','departments','production_stages','users'] loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s', t);
    execute format('create policy "%1$s_read" on public.%1$s for select to authenticated using (true)', t);
    execute format('create policy "%1$s_admin_write" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- =====================================================================
-- SEED DATA
-- =====================================================================
insert into public.roles (role_name, description) values
  ('System Admin',       'Full access including user, department and target configuration'),
  ('General Manager',    'Views all departments and analytics; does not enter floor data'),
  ('Department Head',    'Enters data for own department, limited cross-department view, analytics'),
  ('Floor Supervisor',   'Logs batch start/finish and stage updates for own department'),
  ('Quality / Dispatch', 'Logs QA pass/rework, defects and dispatch for own department')
on conflict (role_name) do nothing;

insert into public.permissions (code, label, sort_order) values
  ('enter_update',   'Enter / Update Data', 1),
  ('view_own_dept',  'View Own Department', 2),
  ('view_all_depts', 'View All Departments', 3),
  ('view_analytics', 'View Analytics', 4),
  ('admin_rights',   'Admin Rights', 5)
on conflict (code) do nothing;

-- Matrix exactly as SRS §5
insert into public.role_permissions (role_id, permission_id, access)
select r.role_id, p.permission_id, m.access
from (values
  ('Floor Supervisor',   'enter_update',   'YES'),
  ('Floor Supervisor',   'view_own_dept',  'YES'),
  ('Quality / Dispatch', 'enter_update',   'YES'),
  ('Quality / Dispatch', 'view_own_dept',  'YES'),
  ('Department Head',    'enter_update',   'YES'),
  ('Department Head',    'view_own_dept',  'YES'),
  ('Department Head',    'view_all_depts', 'LIMITED'),
  ('Department Head',    'view_analytics', 'YES'),
  ('General Manager',    'view_own_dept',  'YES'),
  ('General Manager',    'view_all_depts', 'YES'),
  ('General Manager',    'view_analytics', 'YES'),
  ('System Admin',       'enter_update',   'YES'),
  ('System Admin',       'view_own_dept',  'YES'),
  ('System Admin',       'view_all_depts', 'YES'),
  ('System Admin',       'view_analytics', 'YES'),
  ('System Admin',       'admin_rights',   'YES')
) as m(role_name, code, access)
join public.roles r       on r.role_name = m.role_name
join public.permissions p on p.code = m.code
on conflict do nothing;

insert into public.departments (department_name, description) values
  ('Order & Planning', 'Receives client orders and creates batches'),
  ('Fabric Prep',      'Fabric preparation before printing'),
  ('Printing',         'Printing hub'),
  ('Finishing',        'Finishing and treatment'),
  ('Quality',          'Quality inspection and rework decisions'),
  ('Dispatch',         'Packing and shipment release')
on conflict (department_name) do nothing;

-- Default targets (hours) — change them later from the "Processing Targets" screen
insert into public.production_stages (stage_name, stage_sequence, department_id, target_duration_hrs)
select s.stage_name, s.seq, d.department_id, s.hrs
from (values
  ('Fabric Preparation', 1, 'Fabric Prep', 8),
  ('Printing',           2, 'Printing',    12),
  ('Finishing',          3, 'Finishing',   10),
  ('Quality Inspection', 4, 'Quality',     4),
  ('Packing & Dispatch', 5, 'Dispatch',    6)
) as s(stage_name, seq, dept, hrs)
join public.departments d on d.department_name = s.dept
on conflict (stage_name) do nothing;
