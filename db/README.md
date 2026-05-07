# Database Setup Guide

## Steps

1. Create a Supabase project at https://supabase.com
2. Open SQL Editor
3. Paste contents of `schema.sql` and run it
4. Get your project URL and service key from Project Settings -> API
5. Put them in `.env`

## Tables and Relationships

- `users` -> linked to supabase auth.users (1:1)
- `projects` -> created by a user
- `project_members` -> many-to-many between projects and users
- `tasks` -> belong to a project, assigned to one user
- `progress_notes` -> comments by member on a task
- `task_reviews` -> admin approve/rework records
- `activity_logs` -> all major actions
- `notifications` -> per-user message inbox

## Sample Accounts

Create using the signup page:
- Admin: admin@test.com / admin123 (role: Team Lead)
- Member: member@test.com / member123 (role: Team Member)
