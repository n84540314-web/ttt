-- sample data (run AFTER creating users via signup)
-- replace UUIDs with real ones from your auth.users table

-- example projects
insert into projects (name, description, start_date, deadline, status)
values
('College Website Redesign', 'Redesign the official college website with new pages and improved UI', '2025-01-10', '2025-03-30', 'In Progress'),
('Library Management App', 'Build a small library system for issuing and returning books', '2025-02-01', '2025-04-15', 'Not Started');

-- after creating an admin and member account, you can manually add tasks like:
-- insert into tasks (title, description, project_id, assigned_to, due_date, priority, status)
-- values ('Design homepage', 'Create new landing page mockup', '<project_uuid>', '<member_uuid>', '2025-02-20', 'High', 'In Progress');
