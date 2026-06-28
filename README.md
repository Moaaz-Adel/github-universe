# GitHub Universe

GitHub Universe turns a GitHub profile into a living map: repositories become planets, programming languages form colored star systems, forks become moons, and recent activity becomes signal across the profile dashboard.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, enter a GitHub username, and launch the universe.

Optional:

```bash
GITHUB_TOKEN=ghp_your_token npm run dev
```

The token is read only by Next.js route handlers and raises GitHub API limits.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run format:check
```

## Architecture

The app uses the latest Next.js App Router with React, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Zustand, and TanStack Query.

```text
src/app                  App Router pages, layout, and GitHub API route handlers
src/components/ui        Shared interface primitives
src/features/github      GitHub types, client fetchers, and query hooks
src/features/landing     Landing and username launch experience
src/features/profile     Profile analytics panels and charts
src/features/repository  Repository details modal
src/features/universe    Visualization config, state, math, and Three.js scene
src/lib                  Shared formatting helpers
tests                    Unit, component, and API-mocking tests
```

## Feature Extension Guide

Add a visualization by creating a new component in `src/features/universe`, then expose it from `UniverseExperience` or the dashboard. Keep rendering logic separate from data math, and put reusable calculations in `math.ts`.

Add a GitHub data source by extending the route handler in `src/app/api/github/[username]/route.ts`, updating the contract in `src/features/github/types.ts`, and consuming it through TanStack Query.

Add a language or visual mapping in `src/features/universe/config.ts`. The Three.js scene reads colors from the shared mapping, so new languages work across planets and charts.

## Deployment

Deploy to Vercel or any Next.js-compatible platform.

1. Set `GITHUB_TOKEN` as an encrypted environment variable.
2. Run `npm run build` in CI.
3. Keep pull requests reviewable and merge only after checks pass.

## Roadmap

- GraphQL-powered contribution calendar and pinned repositories.
- Star history and repository growth timelines.
- Fork network and dependency graph visualizations.
- Authenticated private repository mode.
- Shareable universe snapshots.

## Git Workflow

Work on feature branches only. Use Conventional Commits, open a pull request for review, and do not merge directly into the main branch.
