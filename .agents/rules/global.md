---
trigger: always_on
---

# Project Overview (Current Phase: UI Layout & Interactive Prototyping)
[cite_start]This application is an interactive educational frontend prototype designed to simulate a Socratic AI chatbot tool that guides students through the five stages of the Design Thinking methodology (Empathize, Define, Ideate, Prototype, and Test)[cite: 4, 11]. [cite_start]Its current objective is to establish a complete, clickable UI layout that demonstrates user routing, role-specific views, and phase-specific components without live backend operations.

# Core Features & Requirements (UI/UX Scope Only)
- [cite_start]Mock Socratic AI chatbot layout inside a dedicated interactive chat panel UI[cite: 46].
- [cite_start]Interactive split-screen workspace interface integrating the chat window with conditional right-hand canvas views[cite: 46].
- Student dashboard UI featuring a "Resume Recent Work" hero section and a responsive visual project portfolio grid.
- [cite_start]Teacher dashboard ("Command Center") layout featuring high-level metrics, active challenges, and a student monitoring data table[cite: 74, 75, 76].
- [cite_start]Simulated Teacher Review mode using a read-only instance of the main WorkspacePage layout[cite: 75].
- [cite_start]Fully operational client-side routing and clickable mockup navigation for layout evaluation.

# User Roles & Permissions (Navigation Prototyping)
- [cite_start]Teacher: Restricted to the `/teacher` dashboard layout view and the read-only `/teacher/review/:projectId` workspace visualization[cite: 74, 75].
- Student: Accesses the `/dashboard` project portfolio grid and the editable `/workspace/:projectId` interactive phase views.

# Technical Stack Constraints (Current Status)
- Framework: React 18 (Vite boilerplate)
- Styling: Tailwind CSS
- UI Components: shadcn/ui primitives (styled for custom layout integration)
- Routing: React Router (`react-router-dom`)
- Backend & Database: NOT ACTIVE. All data, project logs, and chat flows are strictly simulated using client-side static mock arrays.

# Mandatory Project Architecture & Directory Map
You must strictly align all layout views, page navigation targets, and component directories with this structural map. Do not generate files outside these boundaries:
