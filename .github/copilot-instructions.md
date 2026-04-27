# ZenCrossbow - Reddit Devvit Game

## Architecture Overview

This is a **Reddit Devvit app** - a custom post type with a Phaser 3 game client, Express.js serverless backend, and Reddit platform integration.

**Three-tier structure:**
- `src/client/`: Full-screen webview (Phaser 3 game in portrait 400x600)
- `src/server/`: Serverless Node.js backend (Express routes, Redis state, Reddit API)
- `src/shared/`: Shared TypeScript types between client/server

**Key integration:** Client communicates with server via `fetch('/api/endpoint')`. Server has `context` object from `@devvit/web/server` providing `postId` and `subredditName`.

## Serverless Constraints

The server runs in a **read-only AWS Lambda-like environment**:
- ❌ No `fs`, `http`, `https`, `net` modules
- ❌ No WebSockets or HTTP streaming
- ❌ No SQLite or stateful in-memory processes
- ✅ Use `fetch` instead of `http/https`
- ✅ Use `redis` from `@devvit/web/server` for persistence

## Client: Phaser 3 Game Structure

**Scene hierarchy** (see `src/client/game/main.ts`):
```
Boot → Preloader → MainMenu → Game → LevelUp/GameOver
                                ↓
                    Parallel level scenes (BalloonLevel, BubbleLevel, etc.)
```

**Path aliases** (configured in `src/client/vite.config.ts`):
- `@game` → `src/client/game/`
- `@objects` → `src/client/game/objects/`
- `@scenes` → `src/client/game/scenes/`

**Always use `.js` extension** in imports despite TypeScript files:
```typescript
import Archer from '@objects/archer.js';  // ✅ Correct
import { Game } from '@scenes/Game.js';   // ✅ Correct
```

**Level system:** Levels defined in `@game/utility/constants.ts`. Each level specifies type (scene), phase, arrows, and targets. Game scene launches parallel level scene which handles target spawning and collision detection.

## Server: Express Routes & Reddit Integration

**Key files:**
- `src/server/index.ts`: Express app with `/api/*` routes and `/internal/*` Devvit hooks
- `src/server/core/post.ts`: Creates Reddit custom posts with splash screen config

**Context usage:** All routes access `context` from `@devvit/web/server`:
```typescript
const { postId, subredditName } = context;
```

**Post creation:** On app install, server creates custom post via `reddit.submitCustomPost()` with splash screen configuration (icons, descriptions, button labels).

**Leaderboard API note:** `/api/fetch-highscores` accepts optional query param `limit` (clamped to `1..50`) so clients can request size-aware score counts.

## Development Workflow

**Primary commands** (from `package.json`):
- `npm run dev` - Runs client watch build, server watch build, and devvit playtest concurrently
- `npm run build` - Production builds both client and server
- `npm run deploy` - Build and upload to Reddit
- `npm run launch` - Build, deploy, and publish to production

**Local browser preview testing (outside Devvit playtest):**
- `npm run dev` does **not** start a Vite web server on `localhost:5173`; it only runs watch builds plus playtest.
- To open `preview.html` directly in a browser, run:
```powershell
cd src/client
npx vite
```
- Then open `http://localhost:5173/preview.html`.
- To simulate taller Reddit post containers, use browser responsive mode (for example, `400x900`) and verify leaderboard spacing.

**Updating splash screen:** Must uninstall then reinstall the app:
```powershell
devvit uninstall zencrossbow_dev
devvit install zencrossbow_dev
```

**Build outputs:**
- Client → `dist/client/` (referenced in `devvit.json` post.dir)
- Server → `dist/server/index.cjs` (referenced in `devvit.json` server.entry)

## Code Conventions

**TypeScript configs:** Uses workspace references - `tools/tsconfig-base.json` extended by client/server/shared configs.

**Phaser game objects:** Create as classes extending Phaser sprites/containers. See `src/client/game/objects/archer.ts` for pattern with animations, state machines, and input handling.

**Level scene pattern:** Each level scene (e.g., `BalloonLevel`) runs parallel to `Game` scene. Game scene gets level scene reference via `this.scene.get('Game') as Game` to update score/targets. Collision detection handled in level scenes.

**Preview scene leaderboard layout:** In `src/client/game/scenes/Preview.ts`, row count is dynamic based on available vertical space. It computes a max visible row count, requests matching score count from the server (`/api/fetch-highscores?limit=...`), and reserves the last visible line for the current user's rank when they are outside the visible top rows.

**Audio context:** Handle mobile audio suspension in `src/client/game/main.ts` via `visibilitychange` and `focus` events to resume suspended WebAudio context.

**Debugging:** Set `Game.DEBUGGING = true` in `Game.ts` for physics debug graphics. `Game.CHEAT = true` enables cheat keys (e.g., ZERO key for instant level up).

## Asset Management

**Assets location:** `src/client/public/assets/` - backgrounds, fonts (bitmap fonts with XML), sound

**devvit.json media:** `assets/` folder for splash screen icons referenced in `post.ts` splash config.

**Bitmap fonts:** Use Phaser BitmapText with fonts defined in XML (e.g., `moghul`, `CoffeeSpark`). See UI creation in `Game.ts` `createUI()` method.
