<<<<<<< HEAD
# v0-team-task-manager

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_s6cQ6gq7qRVjnYxTqlV30hbvuktC)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/hemanthkumar4041/v0-team-task-manager" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
=======
# Team Task Manager

A simple full stack web application for managing teams, projects and tasks.
Built as a college assessment project using HTML, CSS, JavaScript, Node.js,
Express.js and Supabase.

## Features

- Signup / Login with role selection (Team Lead / Team Member)
- Role based access control
- Create and manage projects
- Add team members to projects
- Create and assign tasks
- Member submits work -> Admin reviews -> Approve or Request Rework
- Activity timeline & notifications
- Overdue tasks highlighted in red
- Search and filter tasks
- Member performance report
- Project completion progress bars

## Folder Structure

```
team-task-manager/
├── frontend/          # HTML, CSS, JS pages
│   ├── html/
│   ├── css/
│   └── js/
├── backend/           # Node.js + Express
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
├── db/                # SQL schema
├── script-video/      # Demo script
├── README.md
├── req.txt
└── package.json
```

## Setup Steps

1. Install Node.js (v16 or above)
2. Run `npm install`
3. Create a Supabase project at https://supabase.com
4. Run `db/schema.sql` in Supabase SQL editor
5. Copy `.env.example` to `.env` and fill in your Supabase URL and Service Key
6. Start server: `npm start`
7. Open http://localhost:5000

## Sample Accounts

After running the app, signup these for testing:

- Admin: admin@test.com / admin123 (role: Team Lead)
- Member: member@test.com / member123 (role: Team Member)

## API Endpoints (short list)

- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/projects
- POST /api/projects
- GET  /api/tasks
- POST /api/tasks
- POST /api/tasks/:id/submit
- GET  /api/reviews/pending
- POST /api/reviews/:id/approve
- POST /api/reviews/:id/rework
- GET  /api/notifications
- GET  /api/reports/dashboard
- GET  /api/reports/performance

## Deployment (Railway)

1. Push code to GitHub
2. Go to Railway -> New Project -> Deploy from GitHub
3. Add env variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, PORT)
4. Railway will run `npm start` automatically

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: Supabase (PostgreSQL)
- Auth: Supabase Authentication
- Deployment: Railway
>>>>>>> a7c820132f813f72e68643e35e00d76533d08fab
