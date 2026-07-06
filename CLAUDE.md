# ZenCrossbow — CLAUDE.md

Reddit Devvit app: a Phaser 3 bow-and-arrow game (client webview) with an Express
serverless backend. Live on Reddit ("Games on Reddit"), so treat every `/api/*`
endpoint as a public, abusable surface — never trust client-supplied data.

See `.github/copilot-instructions.md` for the full architecture walkthrough
(scene hierarchy, level system, asset pipeline). Keep both files in sync when
conventions change.

## Layout

- `src/client/` — Phaser 3 game (portrait 400x600). Two entrypoints: `index.html`
  (game) and `preview.html` (inline feed post / leaderboard).
- `src/server/` — Express routes bundled to a single `dist/server/index.cjs`.
  Serverless: no `fs`/`http`/`net`/WebSockets; use `fetch` and `redis` from
  `@devvit/web/server`.
- `src/shared/types/api.ts` — request/response types shared by both sides.
- `devvit.json` — Devvit config: entrypoints, mod menu items, triggers.

## Commands

- `npm run dev` — watch builds + `devvit playtest` (needs Reddit login; posts to
  r/zencrossbow_dev). It does NOT serve on localhost; for a browser preview run
  `npx vite` inside `src/client` and open `http://localhost:5173/preview.html`.
- `npm run build` / `build:server` / `build:client` — production builds.
- `npm run check` — type-check + eslint --fix + prettier.
- `npx vitest run` — tests. There is no `npm test` script.
- `npm run deploy` — build + `devvit upload`. `npm run launch` also publishes.

## Gotchas

- **Pre-existing type errors**: `npm run type-check` fails on unused-parameter
  errors in `src/client/game/scenes/Settings.ts`. Not caused by your change —
  verify your own files compile and don't chase these unless asked.
- **`*.test.ts` files are excluded** from the tsconfig projects and from ESLint
  (see `eslint.config.js` ignores). Vitest runs them directly; colocate tests
  next to the module under test.
- **Client imports use `.js` extensions** on TypeScript files
  (`import Archer from '@objects/archer.js'`) with aliases `@game`, `@objects`,
  `@scenes` from `src/client/vite.config.ts`.
- **Mod menu actions** need two pieces: an `/internal/menu/...` route in
  `src/server/index.ts` AND a matching entry in `devvit.json` `menu.items`.
  Respond with `{ showToast: '...' }` or `{ navigateTo: '...' }`.
- **Splash screen changes** require `devvit uninstall zencrossbow_dev` then
  reinstall to take effect.

## High scores & name safety

- Storage: Redis sorted set `zencrossbow:highscores` (member = display name,
  score = best score). Endpoints in `src/server/index.ts`.
- `src/server/core/sanitizeName.ts` is the single gate for display names:
  20-char cap (`MAX_NAME_LENGTH`), control-char stripping, and profanity/slur
  masking with leetspeak/spacing/camelCase evasion handling. It has unit tests
  (`sanitizeName.test.ts`) — extend them when touching the filter.
- Names are sanitized at every touchpoint: on write (`/api/post-highscore`,
  which prefers `reddit.getCurrentUsername()` over the client-sent name), on
  read (`/api/fetch-highscores`), and on lookup (`/api/user-rank`). Keep all
  three consistent — stored members are sanitized names.
- Moderators can purge invalid stored entries via the "Clean high score table"
  subreddit menu action (`/internal/menu/clean-highscores`).
- History lesson: the leaderboard was vandalized with obscene ASCII art via
  direct API calls. Any new endpoint that stores user-visible text must
  validate length and content server-side.
