---
name: run-memora-fe
description: Build, run, and drive the memora-fe Next.js 16 app. Use when asked to start memora-fe, run its tests, build it, take a screenshot of its UI, or interact with the running app on port 9999.
---

Memora-fe is the Next.js 16 (App Router, Turbopack) frontend for the Memora OS project. An agent drives it via the headless-chrome wrapper `.claude/skills/run-memora-fe/driver.mjs` — it has no external driver dep, just the Chrome already installed on Windows.

All paths below are relative to `memora-fe/`.

## Prerequisites

Windows 11, Node 20+, Google Chrome at the standard install path (`C:\Program Files\Google\Chrome\Application\chrome.exe`). Verified working with the Chrome that ships on this box.

```bash
node --version   # ≥ 20
```

## Setup

One-time, after clone:

```bash
npm install
```

`next dev` reads `.env` (already populated with placeholder Google client ID). No further config needed for a static smoke run; the app renders without backend connectivity for the public routes (`/`, `/login`, `/register`).

Env vars (from `.env`):

```bash
PORT=9999                                       # default
NEXT_PUBLIC_API_URL=http://localhost:3000        # where the BE lives
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...                # placeholder ok for /login, /register
```

## Build

```bash
npm run build
```

Verified output: `✓ Compiled successfully in 19.1s`, 8 static routes (`/`, `/_not-found`, `/login`, `/profile`, `/projects/[projectId]`, `/projects/[projectId]/graph`, `/projects/user`, `/register`).

## Run (agent path)

```bash
npm run dev   # starts Next on http://localhost:9999 (Turbopack, watch mode)
```

The port is fixed in `package.json` (`next dev -p 9999`). If 9999 is already taken, kill the old PID first:

```bash
netstat -ano | grep ":9999" | head -1
```

Once the server replies, drive it:

```bash
# Smoke-check public routes return 200
node .claude/skills/run-memora-fe/driver.mjs health http://localhost:9999

# Screenshot any page (lands in cwd by default)
node .claude/skills/run-memora-fe/driver.mjs ss http://localhost:9999/login login.png

# Dump rendered DOM to stdout (pipe to file if needed)
node .claude/skills/run-memora-fe/driver.mjs dom http://localhost:9999/projects/user > user.html
```

| command | what it does |
|---|---|
| `health [baseUrl]` | GETs `/`, `/login`, `/register`; exits non-zero if any return non-200 |
| `ss <url> [out.png]` | Launches Chrome headless, screenshots at 1280×800 |
| `dom <url>` | Launches Chrome headless, dumps post-render DOM to stdout |

`ss` and `dom` write a profile dir at `.claude/skills/.chrome-profile/` — safe to delete between runs.

## Run (human path)

```bash
npm run dev   # → http://localhost:9999 in any browser
```

Same command, but a human loads it in a real browser. Stop with Ctrl-C.

## Test

```bash
npm test              # vitest run
```

Tests live under `src/` colocated with components (`*.test.ts(x)`).

## Gotchas

- **Port 9999 is fixed.** `package.json` hardcodes `-p 9999`. If it's bound, the dev server exits with `EADDRINUSE` and you have to kill the listener manually — there's no env override.
- **`NEXT_PUBLIC_API_URL` points to `:3000`.** That's the NestJS backend. Without it running, the dynamic routes (`/projects/[projectId]`, `/projects/[projectId]/graph`, `/profile`) will load the shell but most data fetches return empty / 401. Public static routes render fine on their own.
- **Next 16 ≠ Next 14.** The local `AGENTS.md` warns that this version has breaking changes from training data; `node_modules/next/dist/docs/` is the source of truth. Read it before patching any framework code.
- **Turbopack is the only bundler.** `next build` and `next dev` both use it; no webpack config to override.

## Troubleshooting

- **`EADDRINUSE :::9999`**: another process is on 9999. Find via `netstat -ano | grep ":9999"` and stop the PID, or change the port in `package.json`.
- **Page renders blank in screenshot**: client components haven't mounted yet. Add a `--virtual-time-budget=2000` to the chrome call (extend the driver), or hit the URL via `curl` first to warm the route.
- **Driver says `chrome not found`**: install Chrome to the default Windows path, or edit the `CHROME` constant at the top of `driver.mjs`.