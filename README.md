# NetCare — Internet Support Ticket System

A full-stack ticket management platform for Ethio-Tele internet support: customers report service issues, track queue position, and follow tickets from reported → assigned → in progress → resolved, while admins route work and technicians manage their queue.

## Tech Stack

- **Frameworks:** TanStack Start (SSR) + TanStack Router (file-based routing)
- **UI:** React 19, Tailwind CSS v4 (`@tailwindcss/vite`), [motion](https://motion.dev), [lucide-react](https://lucide.dev)
- **Data:** REST API client in `src/lib/api.ts`, `useFetch` / `useQueuePosition` hooks
- **Auth:** JWT-based client auth context (`src/context/auth.tsx`) with role-based UI (CUSTOMER / TECHNICIAN / ADMIN)
- **Avatars:** [DiceBear](https://www.dicebear.com)
- **Testing:** [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- **Deploy:** [Netlify](https://www.netlify.com) (see `netlify.toml`)

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000` (Netlify middleware is emulated locally).

# Clone & install the backend from

git clone https://github.com/theodore-digicom/ethio-telecom-rms.git
cd ethio-telecom-rms
npm install

start the dev server
npm run dev -- -p 8000

The app runs on `http://localhost:3000` and expects the API at
`http://localhost:8000` (see below).

### Environment Variables

Copy `.env` from the repo or create one with:

```
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the base URL for the REST API (`src/lib/api.ts`). It falls back to `http://localhost:3000` when unset. Additional typed variables live in `src/env.ts` (via `@t3-oss/env-core` + Zod).

## Scripts

| Command                   | Description                            |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Start the Vite dev server on port 3000 |
| `npm run build`           | Build client + server for production   |
| `npm run preview`         | Preview the production build           |
| `npm run test`            | Run the Vitest suite once              |
| `npm run test:watch`      | Run Vitest in watch mode               |
| `npm run lint`            | Lint with ESLint                       |
| `npm run format`          | Format with Prettier + fix with ESLint |
| `npm run check`           | Check formatting with Prettier         |
| `npm run generate-routes` | Regenerate `src/routeTree.gen.ts`      |

## Project Structure

```
src/
├── assets/            # Images (logo, hero)
├── components/        # UI components (HeroShowcase, StatusTrack, ...)
├── context/           # AuthProvider / useAuth
├── data/              # Status/priority/branch/time-slot configs
├── hooks/             # Custom hooks
├── lib/               # API client, types, avatars, useFetch, useQueuePosition
├── routes/            # File-based routes (TanStack Router)
├── router.tsx         # createRouter configuration
├── env.ts             # Typed environment variables
└── styles.css         # Tailwind v4 + theme tokens
```

### Routes

Public pages:

| Route             | Purpose                   |
| ----------------- | ------------------------- |
| `/`               | Landing page              |
| `/login`          | Sign in                   |
| `/register`       | Create an account         |
| `/forgotPassword` | Request a password reset  |
| `/reset-password` | Reset password with token |

Authenticated dashboard (`/_dashboard` layout with sidebar):

| Route                          | Purpose                        |
| ------------------------------ | ------------------------------ |
| `/dashboard`                   | Role-based overview            |
| `/dashboard/profile`           | Edit profile / avatar / delete |
| `/dashboard/queue`             | Technician pickup queue        |
| `/dashboard/report`            | Create a new ticket            |
| `/dashboard/technicians`       | Technician workload list       |
| `/dashboard/tickets`           | Ticket list + filters          |
| `/dashboard/tickets/$ticketId` | Ticket detail / status track   |
| `/dashboard/appointments`      | User appointments              |
| `/dashboard/appointments/new`  | Book a branch appointment      |

## Styling

The app uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. Global styles and design tokens are defined in `src/styles.css`:

```css
@import 'tailwindcss';

@theme {
  --color-primary-green: #2bb673;
  --color-primary-blue: #0072ce;
  --color-text-dark: #1f2937;
  /* ... */
}
```

Custom tokens are available as utilities like `bg-primary-green`, `text-text-secondary`, `border-border`, etc.

**Note:** the root route (`src/routes/__root.tsx`) renders the HTML document shell (`<html>`, `<head>` with `<HeadContent />`, `<body>` with `<Scripts />`). This is what injects the compiled stylesheet into the page — keep this structure intact when editing the layout.

## Testing

Tests use [Vitest](https://vitest.dev) with Testing Library and jsdom:

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Config lives in `vitest.config.ts`; jest-dom matchers are registered in `vitest.setup.ts`.

## Adding A Route

Routes are file-based under `src/routes`. Add a file to create a route:

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <h1>About</h1>
}
```

Then link to it with the `Link` component from `@tanstack/react-router`:

```tsx
import { Link } from '@tanstack/react-router'

;<Link to="/about">About</Link>
```

Run `npm run generate-routes` to refresh `src/routeTree.gen.ts` after structural changes.

## Deployment (Netlify)

1. Push the repo to GitHub
2. Import it at https://app.netlify.com/start
3. Netlify auto-detects the build (`vite build` → `dist/client`)
4. Add `VITE_API_URL` (and any other secrets) under **Site settings → Environment variables**
5. Trigger the first deploy

Server functions and API routes run on Netlify Functions. See the [Netlify docs](https://docs.netlify.com/edge-functions/overview) for Edge Functions.

## Learn More

- [TanStack Start documentation](https://tanstack.com/start)
- [TanStack Router documentation](https://tanstack.com/router)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
