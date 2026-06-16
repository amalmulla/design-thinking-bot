# Homework 2 — Analysis & MongoDB Migration Strategy

## What Section 4 of the Assignment Actually Says

The core technical mandate from the assignment (translated from Hebrew) is:

> *"To display data, you must use **real, relevant data** fetched from an **external database or API**. For local data storage (e.g. user details), you may use a **DB of your choice** — such as MySQL, Firebase, Firestore, **MongoDB**, or Supabase. Please coordinate the chosen DB with your course instructor."*

The assignment also requires: React/Next.js, Tailwind, hooks, and real data — not simulated/hardcoded data.

---

## 1. Current Project Status — How Data Is Managed Today

All four data domains are **100% simulated in the browser** using `sessionStorage`. Here is the exact flow for each:

### 🧑 Users (`/src/UsersManager/usersService.js`)
| Operation | Current Implementation |
|---|---|
| **Seed** | Two hardcoded users (`INITIAL_USERS`) are written to `sessionStorage["users"]` on first load |
| **Read (all users)** | `loadUsers()` → `JSON.parse(sessionStorage.getItem("users"))` |
| **Read (current user)** | `JSON.parse(sessionStorage.getItem("currentUser"))` |
| **Create** | `register()` → pushes new object to in-memory array → `sessionStorage.setItem("users", ...)` |
| **Update** | `updateUser()` / `changeUserRole()` → mutates array in-memory → saves back |
| **Delete/Block** | `toggleBlockUser()` → flips `blocked` flag → saves back |
| **Auth** | `login()` → plain-text password comparison inside the array |

### 📁 Student Projects (`/src/data/challenges.js` + `Dashboard.jsx` + `WorkspacePage.jsx`)
| Operation | Current Implementation |
|---|---|
| **Seed** | `STUDENT_PROJECTS` array hardcoded in `challenges.js` |
| **Read** | `useState(() => JSON.parse(sessionStorage.getItem("studentProjects")))` on component mount |
| **Create** | `createStudentProject()` factory → `unshift` into array → `sessionStorage.setItem(...)` |
| **Update** | `saveProject()` in `WorkspacePage.jsx` → maps over array, replaces matching ID, saves to `sessionStorage` |

### 🎯 Design Challenges (`/src/data/challenges.js` + `Dashboard.jsx`)
| Operation | Current Implementation |
|---|---|
| **Seed** | `ACTIVE_CHALLENGES` hardcoded array |
| **Read** | `useState(() => JSON.parse(sessionStorage.getItem("challenges")))` |
| **Create** | `handleSaveChallenge()` → push to array → `sessionStorage.setItem("challenges", ...)` |

### 💬 Chat Logs (inside `StudentProject.messages`)
| Operation | Current Implementation |
|---|---|
| **Read** | Loaded as part of the full project object from `sessionStorage["studentProjects"]` |
| **Create** | `createChatMessage()` → appended to `messages` array → entire project re-saved via `saveProject()` |

> **Summary:** Every single read, write, and update is a `sessionStorage.getItem / setItem` with `JSON.parse / JSON.stringify`. Data only lives for the duration of the browser session and is lost on tab close. No two browser tabs or users share any state.

---

## 2. The Homework 2 Gap — What Needs to Change

The fundamental architectural problem is that `sessionStorage` is a **local, ephemeral, single-user browser cache** — not a database. Here is a concrete breakdown of every gap:

| Problem | Impact |
|---|---|
| **No persistence** | All data (users, projects, chat logs) is lost when the browser tab closes |
| **No real auth** | Passwords are stored and compared in plain text inside a JSON array |
| **No multi-user sharing** | A teacher cannot see projects that a student created in a different tab/session |
| **Hardcoded seed data** | `STUDENT_PROJECTS` and `ACTIVE_CHALLENGES` are static JS arrays — they don't represent real data |
| **No API layer** | All logic (login, save, fetch) runs directly in React components — there is no server |
| **No data integrity** | Any component can overwrite `sessionStorage` — there is no validation layer |

### The Core Architectural Shift Required

```
CURRENT (HW1):                         REQUIRED (HW2):
┌─────────────────────────┐            ┌──────────────────────────────────────────────────┐
│     React Component     │            │              React Component                      │
│   (Dashboard.jsx etc.)  │            │         (Dashboard.jsx etc.)                      │
│                         │            │                    │                              │
│  reads/writes directly  │   ──────►  │        calls async API functions                  │
│  to sessionStorage[]    │            │                    │                              │
└─────────────────────────┘            │         ┌──────────────────┐                      │
                                       │         │  API Service Layer│                      │
                                       │         │ (new: apiService) │                      │
                                       │         └────────┬─────────┘                      │
                                       │                  │ HTTP fetch()                   │
                                       │         ┌────────▼─────────┐                      │
                                       │         │   Express Server  │                      │
                                       │         │   (new: backend/) │                      │
                                       │         └────────┬─────────┘                      │
                                       │                  │ Mongoose                        │
                                       │         ┌────────▼──────────┐                      │
                                       │         │  MongoDB Atlas     │                      │
                                       └─────────┤  (cloud database) │──────────────────────┘
                                                 └───────────────────┘
```

---

## 3. MongoDB — A Short General Explanation

MongoDB is a **NoSQL document database**. Instead of rows in SQL tables, it stores data as **JSON-like documents** inside **collections**. It maps directly to the data structures you already have.

### Key Concepts
- **Database** → your entire project's data store (e.g., `design-thinking-db`)
- **Collection** → like a table (e.g., `users`, `projects`, `challenges`)
- **Document** → one object/record (e.g., one student's project with all their canvas data)
- **`_id`** → MongoDB auto-assigns a unique ID to every document

### Why MongoDB Fits This Project
Your data is already structured as nested JavaScript objects (users with canvasData, messages, etc.). MongoDB stores these natively — you don't need to flatten them into SQL joins. A `StudentProject` with its nested `canvasData` and `messages[]` array fits perfectly as a single MongoDB document.

### How You Connect — The Standard Stack
For a React + Vite frontend, the standard approach is:

```
React Frontend (Vite)
        │
        │  HTTP (fetch / axios)
        ▼
Express.js REST API  ←── runs on Node.js (e.g., localhost:3001)
        │
        │  Mongoose ODM
        ▼
MongoDB Atlas  ←── free cloud-hosted database (no local install needed)
```

**MongoDB Atlas** is the recommended approach. It is MongoDB's free cloud service — you create a cluster online, get a connection string, and paste it into your backend. No local MongoDB installation is needed.

### The Connection String (what goes in `.env`)
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/design-thinking-db
```

---

## 4. Next Steps — File-by-File Roadmap

> [!IMPORTANT]
> This roadmap covers **only Homework 2** scope. Homework 3 features are excluded.

### Phase A — Backend Setup (New Files)

#### [NEW] `backend/server.js`
- Initialize Express.js app
- Connect to MongoDB Atlas via `mongoose.connect(process.env.MONGODB_URI)`
- Register all route files
- Start listening on `PORT=3001`

#### [NEW] `backend/.env`
- `MONGODB_URI` — MongoDB Atlas connection string
- `PORT=3001`
- `JWT_SECRET` — for session tokens (replaces sessionStorage auth)

#### [NEW] `backend/models/User.js`
- Mongoose schema mirroring the current `User` typedef from `dataModels.js`
- Fields: `name`, `email`, `password` (hashed with bcrypt), `role`, `blocked`

#### [NEW] `backend/models/Project.js`
- Mongoose schema mirroring the `StudentProject` typedef
- Embeds `canvasData` as a nested sub-document
- Embeds `messages[]` as an array of sub-documents

#### [NEW] `backend/models/Challenge.js`
- Mongoose schema mirroring `DesignChallenge`
- Fields: `title`, `description`, `teamCount`, `status`

#### [NEW] `backend/routes/auth.js`
- `POST /api/auth/register` — create user, hash password with bcrypt, save to DB
- `POST /api/auth/login` — find user by email, compare hashed password, return JWT token

#### [NEW] `backend/routes/projects.js`
- `GET /api/projects` — return all projects (teacher view) or filtered by `userId`
- `POST /api/projects` — create new project document in MongoDB
- `PUT /api/projects/:id` — update project (canvas data, phase, messages)
- `GET /api/projects/:id` — fetch single project

#### [NEW] `backend/routes/challenges.js`
- `GET /api/challenges` — return all challenges
- `POST /api/challenges` — teacher creates a new challenge
- `PUT /api/challenges/:id` — update challenge (status, teamCount)

#### [NEW] `backend/routes/users.js`
- `GET /api/users` — return all users (teacher only)
- `PUT /api/users/:id/block` — toggle block status
- `PUT /api/users/:id/role` — change role

---

### Phase B — Frontend API Service Layer (New + Modified Files)

#### [NEW] `src/lib/apiService.js`
- Replace all `sessionStorage` operations with `fetch()` calls to the Express backend
- Every function should be `async` and return the parsed JSON response
- Example functions:
  - `loginUser(email, password)` → `POST /api/auth/login`
  - `getAllProjects()` → `GET /api/projects`
  - `saveProject(projectId, updatedData)` → `PUT /api/projects/:id`
  - `getAllChallenges()` → `GET /api/challenges`

#### [MODIFY] `src/UsersManager/usersService.js`
- **Remove** all `sessionStorage.getItem/setItem` calls
- **Replace** `loadUsers()` / `saveUsers()` with calls to `apiService`
- `login()` should call `loginUser()` from `apiService` and store the returned **JWT token** in `sessionStorage` (only the token, not user data)
- `getCurrentUser()` should decode the JWT or call `GET /api/auth/me`

#### [MODIFY] `src/UsersManager/LoginPage.jsx`
- Make `handleSubmit` async
- Await the `usersService.login()` call (which now calls the API)
- Handle network errors (e.g., server unreachable) in addition to validation errors

#### [MODIFY] `src/UsersManager/Register.jsx`
- Make `handleSubmit` async
- Await the `usersService.register()` call

#### [MODIFY] `src/UsersManager/Dashboard.jsx`
- Replace `useState(() => JSON.parse(sessionStorage.getItem("challenges")))` with a `useEffect` + `apiService.getAllChallenges()`
- Replace `useState(() => JSON.parse(sessionStorage.getItem("studentProjects")))` with a `useEffect` + `apiService.getAllProjects()`
- Replace `sessionStorage.setItem("challenges", ...)` in `handleSaveChallenge()` with `apiService.createChallenge()`
- Replace `sessionStorage.setItem("studentProjects", ...)` in `handleCreateStudentProject()` with `apiService.createProject()`

#### [MODIFY] `src/UsersManager/WorkspacePage.jsx`
- Replace the initial `useState` that reads `sessionStorage["studentProjects"]` with a `useEffect` that calls `apiService.getProjectById(projectId)`
- Replace `saveProject()` (which does `sessionStorage.setItem`) with `apiService.saveProject(projectId, updatedData)` — this should be called on every canvas update and message send

#### [MODIFY] `src/data/challenges.js`
- This file should be **deleted or emptied** — it currently seeds fake static data. Real data will now come from the MongoDB `challenges` collection, seeded once via the backend.

#### [MODIFY] `src/lib/dataModels.js`
- The factory functions (`createUser`, `createStudentProject`, etc.) can remain as helpers for constructing request payloads
- Remove any sessionStorage references if they exist

---

### Phase C — Environment & Configuration

#### [MODIFY] `.env` (root, for Vite frontend)
- Add `VITE_API_URL=http://localhost:3001` so `apiService.js` knows where to send requests

#### [MODIFY] `package.json` (root)
- Add a `dev:backend` script: `"node backend/server.js"` or use `nodemon`
- Optionally add a `dev:all` script using `concurrently` to run both Vite and Express together

#### [NEW] `backend/package.json`
- Separate Node.js project for the backend
- Dependencies: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`

---

### Summary Table

| File | Action | What Changes |
|---|---|---|
| `backend/server.js` | CREATE | Express + MongoDB entry point |
| `backend/models/*.js` | CREATE | Mongoose schemas (User, Project, Challenge) |
| `backend/routes/*.js` | CREATE | REST API endpoints |
| `src/lib/apiService.js` | CREATE | All `fetch()` calls to the backend |
| `src/UsersManager/usersService.js` | MODIFY | Remove sessionStorage, delegate to apiService |
| `src/UsersManager/LoginPage.jsx` | MODIFY | Make async, handle API errors |
| `src/UsersManager/Register.jsx` | MODIFY | Make async, handle API errors |
| `src/UsersManager/Dashboard.jsx` | MODIFY | Replace sessionStorage with useEffect + API calls |
| `src/UsersManager/WorkspacePage.jsx` | MODIFY | Replace saveProject() with API call |
| `src/data/challenges.js` | DELETE/EMPTY | Replaced by real DB data |
| `.env` | MODIFY | Add VITE_API_URL |
| `backend/.env` | CREATE | MONGODB_URI, JWT_SECRET, PORT |
