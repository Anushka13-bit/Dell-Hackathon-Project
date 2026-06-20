# HackOS

AI-enabled hackathon management platform for organizers, participants, and reviewers.

HackOS is designed to replace fragmented hackathon workflows across registration,
team formation, reviewer assignment, evaluation, analytics, communication, and audit
tracking. The current repository contains the HackFlow web interface prototype,
product requirements, frontend architecture, and demo support scripts for validating
the proposed AI workflows.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=111111">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Planned-3FCF8E?logo=supabase&logoColor=111111">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Planned-009688?logo=fastapi&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python-Demo_Scripts-3776AB?logo=python&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_pgvector-Planned-4169E1?logo=postgresql&logoColor=white">
  <img alt="Redis" src="https://img.shields.io/badge/Redis-Planned-FF4438?logo=redis&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini_AI-Planned-8E75B2?logo=googlegemini&logoColor=white">
</p>

## Project Overview

HackOS targets the operational problems that make hackathons hard to scale:

- Organizers lose 20-30 hours per event coordinating across forms, spreadsheets,
  chat tools, reviewer sheets, and analytics dashboards.
- Participants miss updates, struggle to find teammates, and get limited feedback.
- Reviewers are often assigned manually, creating conflict-of-interest and workload
  imbalance risks.
- Evaluation fairness is difficult to prove without statistical monitoring and
  tamper-evident audit trails.

The proposed platform brings these workflows into one role-based system with:

- AI-assisted registration and resume auto-fill.
- Multi-signal duplicate detection with explainable risk scores.
- Optional FaceScan liveness validation with explicit consent.
- Skill-vector team formation and participant matching.
- Expertise-matched reviewer assignment using optimization algorithms.
- Bias detection with statistical tests and reviewer reliability tracking.
- Real-time dashboards for organizers, participants, and reviewers.
- Promotion content generation and communication workflows.
- SHA-256 hash-chain audit trail design for traceability.

## Current Build Status

The implementation is currently frontend-first. The repository contains a polished
Next.js prototype with mocked/static data, route coverage for the main product
surfaces, and planning/demo assets for the backend and AI services.

| Area | Status | Progress | Notes |
| --- | --- | ---: | --- |
| Product requirements | Documented | 95% | Full PRD, requirement matrix, user flows, AI architecture, and non-functional targets are in `docs/prd.md`. |
| Frontend architecture | Documented | 90% | Organizer, participant, and reviewer screen architecture is detailed in `docs/frontend.md`. |
| Landing and auth UI | Built | 80% | Landing page and organizer/participant auth screens are implemented in Next.js. |
| Organizer portal | Built prototype | 75% | Dashboards, hackathon creation flow, registrations, teams, submissions, reviewers, evaluations, and analytics routes are present. |
| Participant portal | Built prototype | 70% | Dashboard, challenge browsing, team creation, team joining, and team workspace views are present. |
| Participant onboarding | Built prototype | 75% | Multi-step Zustand-powered onboarding includes name, email, phone, FaceScan simulation, profile, resume upload, pipeline, and success states. |
| Reviewer experience | Built prototype | 45% | Reviewer evaluation screen and layout exist; queue, rubric, leaderboard, and help links are not yet implemented as full routes. |
| AI/backend services | Designed | 20% | FastAPI, Celery, Supabase, Redis, pgvector, Gemini, statistical testing, and audit-chain behavior are specified but not implemented as production services in this repo. |
| Demo validation scripts | Drafted | 55% | Load simulation, k6 testing, bias injection, engagement seeding, mock data generation, and FaceScan validator files exist under `completion & demo/`. |
| Production readiness | Planned | 25% | Architecture decision records and demo strategy define the path, but deployment, auth integration, data persistence, and live APIs remain pending. |

Estimated repository completion: 60% for the hackathon demo prototype, and 35% for
the full production platform described in the PRD.

## Tech Stack

### Implemented in this repository

| Layer | Technology | Purpose |
| --- | --- | --- |
| Web framework | Next.js 16 | App Router frontend application. |
| UI runtime | React 19 | Component-based web interface. |
| Language | TypeScript | Type-safe application code. |
| Styling | Tailwind CSS 4 | Utility-first styling and design system implementation. |
| State management | Zustand | Participant onboarding state. |
| Forms and validation | React Hook Form, Zod | Planned form handling and validation dependencies. |
| Animation | Framer Motion | Onboarding and UI motion states. |
| Icons | Lucide React, Material Symbols | Interface icons and visual affordances. |
| Webcam | React Webcam | FaceScan liveness prototype. |
| Scripts | Python, k6 | Demo data generation, bias injection, load testing, and validation support. |

### Planned platform stack from the PRD

| Layer | Technology | Purpose |
| --- | --- | --- |
| Backend API | FastAPI | Modular monolith API with extraction path to microservices. |
| Background jobs | Celery | Async registration, AI, notification, and evaluation workloads. |
| Database | Supabase PostgreSQL | Primary data store, Auth, Row Level Security, and Realtime features. |
| Vector search | pgvector | Embedding storage and semantic matching. |
| Cache and pub/sub | Redis | Celery broker, cache, locks, and realtime event bridge. |
| AI extraction and generation | Gemini Flash | Resume extraction, feedback generation, promotion content, and translation. |
| Embeddings | sentence-transformers | Local skill, reviewer, project, and knowledge-base embeddings. |
| Statistics | SciPy, NumPy | Bias detection, reviewer reliability, normalization, and assignment optimization. |
| Audit trail | SHA-256 hash chain | Tamper-evident event history. |
| Deployment path | Docker Compose, AWS ECS Fargate, Aurora, SQS | MVP-to-production scaling strategy. |

## Repository Structure

```text
.
|-- README.md
|-- docs/
|   |-- prd.md
|   |-- frontend.md
|   |-- prd1.md
|   `-- 1. Hackathon Problem Statement Template - AI-Enabled+Hackathon+Management+Dashboard.pdf
|-- frontend/
|   |-- package.json
|   |-- src/app/
|   |   |-- auth/
|   |   |-- onboarding/
|   |   |-- organizer/
|   |   |-- participant/
|   |   `-- reviewer/
|   |-- src/components/
|   |-- src/store/
|   `-- src/lib/
|-- completion & demo/
|   |-- ADR-001-modular-monolith.md
|   |-- DEMO_STRATEGY.md
|   |-- FaceScanValidator.tsx
|   |-- bias_injection.py
|   |-- engagement_seeder.py
|   |-- k6_load_test.js
|   |-- load_simulator.py
|   `-- mock_data_generator.py
`-- stitch_modern_hackathon_management_suite/
    `-- Static HTML and screenshot design references
```

## Key Application Surfaces

### Organizer

- Multi-hackathon dashboard.
- Hackathon creation wizard with basic details, problem statements, rubrics,
  reviewer invitations, and publish summary.
- Registration review screens with duplicate-risk and FaceScan status concepts.
- Teams, submissions, reviewers, evaluations, analytics, and individual hackathon
  views.

### Participant

- Participant dashboard.
- Challenge browsing.
- Team creation, team joining, and team workspace views.
- Multi-step onboarding with verification simulation and profile provisioning.

### Reviewer

- Reviewer layout and evaluation screen.
- Score input, rubric-oriented judging UI, and review workflow prototype.

## AI and Fairness Design

The PRD defines the AI layer around measurable, explainable components:

- Resume parsing and structured skill extraction.
- Unified participant skill vectors.
- Duplicate detection using exact, fuzzy, semantic, device, and IP signals.
- Reviewer assignment with expertise matching, workload balance, and conflict
  avoidance.
- Bias detection using z-scores, Mann-Whitney U, Kruskal-Wallis, and inter-reviewer
  reliability measures.
- Score normalization and confidence scoring before results publication.
- Personalized feedback and promotional copy generation through Gemini.

The current repository documents these services and includes demo support scripts,
but live API endpoints and persistent AI service integration are still pending.

## Getting Started

### Prerequisites

- Node.js 20 or later.
- npm.

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

### Build the frontend

```bash
cd frontend
npm run build
```

### Lint the frontend

```bash
cd frontend
npm run lint
```

## Available Routes

```text
/
/auth/organizer
/auth/participant
/onboarding/participant
/organizer/dashboard
/organizer/hackathons
/organizer/hackathons/create/step-1
/organizer/hackathons/create/step-2
/organizer/hackathons/create/step-3
/organizer/hackathons/create/step-4
/organizer/hackathons/create/step-5
/organizer/hackathons/[id]
/organizer/hackathons/[id]/registrations
/organizer/hackathons/[id]/teams
/organizer/hackathons/[id]/submissions
/organizer/hackathons/[id]/reviewers
/organizer/hackathons/[id]/evaluations
/organizer/hackathons/[id]/analytics
/organizer/registrations
/organizer/teams
/organizer/submissions
/organizer/reviewers
/organizer/evaluations
/organizer/analytics
/participant/dashboard
/participant/challenges
/participant/teams
/participant/teams/create
/participant/teams/join
/participant/teams/workspace
/reviewer/evaluation
```

## Demo Assets

The `completion & demo/` directory supports hackathon presentation preparation:

- `DEMO_STRATEGY.md`: coverage gaps, demo positioning, and production path.
- `ADR-001-modular-monolith.md`: backend architecture decision record.
- `mock_data_generator.py`: curated registration and duplicate detection data.
- `bias_injection.py`: synthetic evaluation bias scenarios.
- `engagement_seeder.py`: seeded engagement metrics.
- `load_simulator.py`: registration throughput simulation.
- `k6_load_test.js`: k6 load test scaffold.
- `FaceScanValidator.tsx`: FaceScan validation prototype.

## Roadmap

| Priority | Work item |
| --- | --- |
| P0 | Connect frontend forms and dashboards to real Supabase/FastAPI APIs. |
| P0 | Implement authentication, roles, and route protection. |
| P0 | Add persistent hackathon, participant, team, reviewer, submission, and evaluation models. |
| P0 | Implement registration pipeline, resume parsing, duplicate detection, and FaceScan consent handling. |
| P0 | Implement reviewer assignment optimizer and evaluation submission APIs. |
| P0 | Implement bias detection, score normalization, results computation, and audit logging. |
| P1 | Add realtime updates with Supabase Realtime or Redis-backed WebSockets. |
| P1 | Add RAG chatbot, journey-stage notifications, and promotion content generation. |
| P1 | Add production deployment configuration, environment templates, observability, and CI checks. |
| P1 | Replace static demo data with seeded fixtures and integration tests. |

## Documentation

- Product requirements: `docs/prd.md`
- Frontend architecture: `docs/frontend.md`
- Demo strategy: `completion & demo/DEMO_STRATEGY.md`
- Architecture decision record: `completion & demo/ADR-001-modular-monolith.md`

## Project Note

The product documentation uses the name HackOS for the overall platform. The
frontend implementation currently uses HackFlow as the visible UI brand. This
README treats HackOS as the platform name and HackFlow as the current web
experience.
