# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: React + TypeScript source. Notable folders: `logic/` (SRS, navigation), `hooks/`, `styles/`, and UI components (`*.tsx`).
- `static/`: Public assets and content. Flashcards live in `static/cards/<deck>/<id>.md`.
- `public/`: Build output (gitignored). Do not edit by hand.
- `index.html`: Vite entry for local dev; `vite.config.ts` configures build and the cards manifest generator.

## Build, Test, and Development Commands
- `yarn dev`: Start Vite dev server on `5173` with live reload; regenerates the cards manifest on changes.
- `yarn build`: Build to `public/` and generate a fresh manifest.
- `yarn preview`: Serve the production build on `5050`.
- `yarn typecheck`: Run TypeScript project checks.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; LF line endings (`.editorconfig`).
- TypeScript: strict mode enabled; prefer explicit types at public boundaries.
- Components: `PascalCase` in `*.tsx` (e.g., `MarkdownCard.tsx`).
- Hooks: `useX.ts` (e.g., `useCardNav.ts`). Utilities: `camelCase.ts`.
- CSS: kebab-case filenames under `src/app/styles/`; import via `src/app/styles.ts`.
- Imports: use `@app/*` path alias when helpful.

## Testing Guidelines
- No test framework is configured yet. For now: run `yarn typecheck` and verify behavior in `yarn dev`.
- If adding tests, prefer Vitest and colocate as `src/**/__tests__/*.test.ts` or `*.test.tsx`.
- Keep logic pure in `src/app/logic/` to make unit testing straightforward.

## Commit & Pull Request Guidelines
- Commits: short, imperative messages (e.g., "Add due mode", "Fix typo"). Keep focused and scoped.
- PRs: include a clear description, reproduction steps, and screenshots/GIFs for UI changes. Link related issues.
- Do not commit build artifacts (`public/`) or generated files (`static/cards-manifest.json`).

## Security & Configuration Tips
- Content-only app; avoid embedding secrets. Place flashcards as Markdown under `static/cards/`.
- Use Yarn 4 via Corepack (`yarn` in the Nix shell). If not using Nix, ensure a recent Node and Yarn are available.
