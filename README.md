# NexDesk

NexDesk is a polished mini IT service management dashboard for keeping support requests moving from intake to resolution. It is designed as a focused portfolio project that demonstrates ticket workflow concepts, operational visibility, and thoughtful enterprise UI design.

## What is included

- Seeded ticket queue with realistic hardware, software, network, and access requests
- Overview metrics for open work, in-progress work, resolved tickets, and service health
- Search, status/category filters, and priority/status sorting
- Create-ticket modal with lightweight validation
- Ticket detail drawer with editable status and assignee
- Timestamped activity history for ticket status changes
- Browser `localStorage` persistence with no backend required for v1
- Responsive desktop-first layout with mobile navigation

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide icons
- Sonner toasts
- Browser localStorage for persistence

## Run locally

```bash
pnpm install
pnpm dev
```

The app is served at `http://localhost:3000`.

## Validation

```bash
pnpm check
pnpm build
```

## Project structure

```text
client/
  src/
    pages/Home.tsx       # NexDesk dashboard, ticket state, and interactions
    index.css            # visual system and responsive layout styles
    App.tsx              # app shell and routing
  index.html             # page metadata and font loading
server/                  # scaffold compatibility server
shared/                  # scaffold compatibility types
```

## Portfolio talking points

NexDesk intentionally keeps scope tight: there is no authentication, backend API, email notification system, or real-time collaboration in v1. This makes the workflow easy to understand while leaving clear future extensions such as SLA timers, charts, role-based queues, and a persistent API.
