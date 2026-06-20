# Design Thinking Bot

An AI-assisted web platform that guides students through the five phases of the
**Design Thinking** process — Empathize, Define, Ideate, Prototype, and Test —
with a **Socratic AI facilitator** that asks guiding questions instead of handing
out answers. Teachers create design challenges, monitor progress, and review
student work; students run projects through an interactive workspace.

Built as an academic project (the `sessionStorage` prototype from HW1 was
migrated to a real Express + MongoDB backend in HW2 — see [docs/Homework/](docs/Homework/)).

## Features

- **Socratic AI chatbot** — a facilitator that responds only with thought-provoking
  questions tailored to the student's current phase. Falls back to high-quality
  simulated prompts when no API key is configured.
- **5-phase Design Thinking workspace** — Empathize / Define / Ideate / Prototype / Test,
  with dedicated tools: Design Canvas, Persona Builder, Ideation Board, Prototype
  Tools, and a Progress Tracker.
- **Role-based access** — separate Student and Teacher experiences with protected routes.
- **Teacher dashboard** — create/manage challenges, review student projects, manage users
  (block/unblock, change roles).
- **Real persistence** — users, projects, challenges, and chat logs stored in MongoDB Atlas.
- **Secure auth** — JWT sessions, bcrypt-hashed passwords, Helmet, and rate limiting.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, shadcn / base-ui, React Router 7 |
| Backend  | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| AI       | Cerebras API (`gpt-oss-120b`), proxied through Vite |
| Auth     | JWT, bcryptjs |

## Architecture

```
React Frontend (Vite, :5173)
        │  fetch()  ──►  src/lib/apiService.js
        ▼
Express REST API (Node.js, :3001)
        │  Mongoose ODM
        ▼
MongoDB Atlas (cloud database)

Socratic AI:  ChatBot ─► src/lib/aiService.js ─► /api-cerebras proxy ─► Cerebras API
              (falls back to simulated prompts if VITE_API_KEY is unset)
```

## Prerequisites

This project relies on **external infrastructure that you must provide your own
credentials for** — nothing is bundled or shared in the repo. Before running it,
set up the following accounts and obtain their credentials:

- **Node.js** 18+ and npm
- **MongoDB Atlas** account — create a free cluster and copy *your own* connection
  string (includes your database username and password).
- **Cerebras API key** *(optional)* — sign up at Cerebras and generate *your own*
  API key for live AI responses. Without it, the bot runs in simulated fallback mode.
  > Note: this key is exposed to the frontend via a variable named `VITE_API_KEY`.
  > The `VITE_` prefix is just Vite's naming convention for browser-visible env
  > vars — Vite does **not** generate the key. The key itself comes from Cerebras.

You then paste these credentials into the `.env` files described below. The
provided `.env` examples contain only placeholders — replace every
`<...>` / `your-...` value with your own.

## Getting Started

The app has two parts that run separately: the **backend** API and the
**frontend** dev server.

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` and fill in **your own** credentials:

```env
# Your MongoDB Atlas connection string (replace user, password, and cluster host)
MONGODB_URI=mongodb+srv://<your-user>:<your-password>@cluster0.xxxxx.mongodb.net/design-thinking-db
# Any long random string you choose — used to sign session tokens
JWT_SECRET=replace-with-a-long-random-string
PORT=3001
```

Seed sample challenges and projects (optional), then start the server:

```bash
npm run seed   # optional: inserts demo challenges + projects (does NOT create users)
npm run dev    # starts the API on http://localhost:3001 (nodemon)
```

### 2. Frontend

In a **second terminal**, from the project root:

```bash
npm install
```

Create `.env` in the project root and fill in **your own** values:

```env
VITE_API_URL=http://localhost:3001
# Your own Cerebras API key (optional — omit this line to use simulated AI)
VITE_API_KEY=<your-cerebras-api-key>
```

Start the dev server:

```bash
npm run dev    # starts Vite on http://localhost:5173
```

Open http://localhost:5173 and **register** a new account (the seed script does not
create login users, so the first user must be created through the Register page).

## Environment Variables

All values below are **your own** — obtained from the external services above, not
provided by this repo.

**Frontend (`.env`)**

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_API_URL`  | Yes      | Base URL of the backend API |
| `VITE_API_KEY`  | No       | Your Cerebras API key; if absent, the AI uses simulated prompts |

**Backend (`backend/.env`)**

| Variable      | Required | Description |
|---------------|----------|-------------|
| `MONGODB_URI` | Yes      | Your MongoDB Atlas connection string (with your DB user + password) |
| `JWT_SECRET`  | Yes      | A long random string you choose, used to sign JWT session tokens |
| `PORT`        | No       | API port (defaults to `3001`) |

## Scripts

**Frontend (root)**

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Start the Vite dev server |
| `npm run build`   | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint |

**Backend (`backend/`)**

| Command         | Description |
|-----------------|-------------|
| `npm run dev`   | Start the API with nodemon |
| `npm start`     | Start the API with node |
| `npm run seed`  | Seed demo challenges and projects |

## Project Structure

```
.
├── src/
│   ├── App.jsx              # Routes + role-based route guards
│   ├── components/          # ChatBot, DesignCanvas, IdeationBoard,
│   │                        # PersonaBuilder, ProgressTracker, PrototypeTools, ui
│   ├── UsersManager/        # Login, Register, Dashboard, Workspace, ManageUsers, profile
│   ├── lib/                 # apiService, aiService, designThinkingEngine, analytics
│   └── data/                # questions, challenges, templates
├── backend/
│   ├── server.js            # Express app + MongoDB connection
│   ├── models/              # User, Project, Challenge (Mongoose schemas)
│   ├── routes/              # auth, users, projects, challenges
│   └── seed.js              # Sample data seeder
└── docs/                    # Assignment brief + homework analysis
```
