-- Team Task Manager - Database Schema
-- Run this in Supabase SQL Editor

-- 1. users table (linked to supabase auth)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'member')),
  created_at timestamp with time zone default now()
);

-- 2. projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  deadline date,
  status text default 'Not Started',
  created_by uuid references users(id),
  created_at timestamp with time zone default now()
);

-- 3. project_members - many to many
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  added_at timestamp with time zone default now(),
  unique(project_id, user_id)
);

-- 4. tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete cascade,
  assigned_to uuid references users(id),
  due_date date,
  priority text default 'Medium' check (priority in ('Low','Medium','High')),
  status text default 'Not Started',
  created_by uuid references users(id),
  created_at timestamp with time zone default now()
);

-- 5. progress notes / comments by member
create table if not exists progress_notes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references users(id),
  note text not null,
  created_at timestamp with time zone default now()
);

-- 6. task_reviews - admin actions on submitted tasks
create table if not exists task_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references users(id),
  action text not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- 7. activity logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  task_id uuid,
  project_id uuid,
  created_at timestamp with time zone default now()
);

-- 8. notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- enable RLS (we use service key in backend so it bypasses, but enable for safety)
alter table users enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table project_members enable row level security;
alter table progress_notes enable row level security;
alter table task_reviews enable row level security;
alter table activity_logs enable row level security;
alter table notifications enable row level security;

-- allow read for authenticated
create policy "read users" on users for select using (true);
create policy "read projects" on projects for select using (true);
create policy "read tasks" on tasks for select using (true);
create policy "read pm" on project_members for select using (true);
create policy "read notes" on progress_notes for select using (true);
create policy "read reviews" on task_reviews for select using (true);
create policy "read activity" on activity_logs for select using (true);
create policy "read notif" on notifications for select using (auth.uid() = user_id);
