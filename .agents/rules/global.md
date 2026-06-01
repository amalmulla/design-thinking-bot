---
trigger: always_on
---

# Project Overview (Current Phase: Client-Side Logic, TypeScript & Live GenAI)
This application is an educational frontend application designed to act as a Socratic AI chatbot tool that guides students through the five stages of the Design Thinking methodology (Empathize, Define, Ideate, Prototype, and Test). 
Its current objective is to transition from a static UI layout into a fully interactive client-side application using TypeScript data contracts, `sessionStorage` for state persistence, and the live Google Gemini API for chatbot interactions.

# Core Features & Requirements
- **Live Socratic AI Chatbot:** An interactive chat panel integrated with `@google/generative-ai` that uses prompt engineering to guide students through specific Design Thinking phases.
- **Interactive Split-Screen Workspace:** Integrates the chat window with dynamic, phase-specific right-hand canvas views (Empathy Map, POV Canvas, Ideation Board, etc.).
- **Data Persistence:** User authentication, project creation, and canvas inputs are managed and persisted strictly through browser `sessionStorage`. 
- **Teacher Dashboard & Evaluation:** A "Command Center" featuring high-level metrics, active challenges, and a student monitoring table. Includes a "Two-Bot" architecture where the teacher can trigger a hidden Gemini API call to evaluate student chat logs and assign a creativity score.
- **Role-Based Navigation:** Complete client-side routing protecting Student and Teacher views based on the active `sessionStorage` user role.

# User Roles & Permissions
- **Teacher (Admin):** Accesses `/teacher` to manage Design Challenges, block users, and monitor class progress. Accesses `/teacher/review/:projectId` for a read-only workspace view to run AI evaluations on student work.
- **Student:** Accesses `/dashboard` to view their project portfolio grid and `/workspace/:projectId` to interact with the AI and fill out design canvases.

# Technical Stack Constraints (Current Status)
- **Framework:** React 19 (Vite boilerplate)
- **Language:** Migrating core data models and complex logic to **TypeScript** (`.ts`/`.tsx`).
- **Styling:** Tailwind CSS v4 (with native dark mode variables).
- **UI Components:** shadcn/ui primitives (styled for custom layout integration).
- **Routing:** React Router DOM v7.
- **AI Integration:** `@google/generative-ai` and `react-markdown`.
- **Backend & Database Constraints:** NO Node.js, Express, or MongoDB yet. All database operations must be simulated using robust `sessionStorage` arrays mapped to strict TypeScript interfaces.

# Mandatory Project Architecture & Directory Map
You must strictly align all files with this structural map. 
- `src/components/ui/` - Atomic UI primitives (buttons, inputs).
- `src/components/` - Complex modular features (ChatPanel, DesignCanvas, IdeationBoard).
- `src/pages/` - Route views grouped by role (`/student`, `/teacher`, `/workspace`).
- `src/UsersManager/` - User registration, login, and `usersService.js/ts` session logic.
- `src/types.ts` - Centralized TypeScript interfaces (User, StudentProject, DesignChallenge, ChatMessage).
- `src/lib/` - Service integrations (e.g., `aiService.ts`, `socraticQuestions.js`).