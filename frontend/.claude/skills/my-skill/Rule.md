AI Coding Agent System Rules & Constraints (Refactored)

1. Architectural Alignment (MCP & Indexing)

CodeGraph first. When exploring codebase dependencies, call graphs, or blast-radius analysis, query the local CodeGraph tool via MCP before falling back to other search methods. Check .codegraph/ for structural routing and definitions before doing a manual search.
Avoid unindexed grepping. Do not run broad, unindexed grep/rg sweeps across build output, vendor/, node_modules, or heavy SDK asset directories — CodeGraph should resolve these faster and more accurately.
Exception: if CodeGraph data is stale, missing for a target, or the target is a string literal / config value unlikely to be graphed, a scoped grep against the specific directory is acceptable. Don't refuse a quick, targeted grep just to satisfy this rule when it's clearly the right tool.

2. Authorization & Defensive Logic Rules

No naive membership checks. When evaluating permissions or building conditional views (e.g. isOwner), don't rely on a bare .some() existence check against a list. Explicitly match on the correct identifier field (confirm whether the backend uses userId or id — don't assume) and the role string.
Normalize role casing defensively — for UI only. Lowercase backend role strings before comparison (role.toLowerCase() === 'owner') to avoid mismatches from inconsistent casing (e.g. "OWNER" vs "owner"). This protects display/UI affordance logic (show/hide a button, conditionally render a panel) — it is not a substitute for server-side authorization. Any destructive or sensitive action must still be authorized server-side regardless of what the client believes the role is.
Handle async auth state with a loading boundary, not a bypass. A 401/403 from an API call is a real signal and must not be ignored or deferred. The actual problem to solve is the race condition where role data hasn't loaded yet and an error boundary flashes incorrectly for a legitimate owner. Solve it like this:

Track auth/role resolution as an explicit state: loading | authorized | unauthorized.
Render a neutral loading state (skeleton/spinner) while loading.
Only render the error boundary once resolution is unauthorized, and only render protected content once it's authorized.
Do not render gated content optimistically before the access check has resolved, and do not suppress or delay processing of a genuine 401/403 response. The goal is eliminating UI flicker for legitimate users, not weakening the access check itself.

3. UI Layer Separation (Marketing vs. Product UI)

Strictly separate Marketing UI (landing pages) from Product UI (app/dashboard/core functional views).

A. Landing Page Layouts (Marketing UI)

High-vibrancy visuals are encouraged: fluid gradients (hero gradient, blue glow radial), atmospheric backdrops, neon particle glows, animated gradient text (animate-gradient-text).
Objective: emotional engagement, aesthetic conversion, premium brand presentation.

B. Functional Viewports & Dashboards (Product UI)

Backgrounds: no gradients on core functional page backgrounds. Workspace canvases use a flat, static solid color (Deep Cosmos #001033 or #13001a) to preserve typography contrast and reduce visual fatigue.
Surfaces & cards: structured, clean, layered glassmorphic materials. Solid elevated surfaces (Midnight Navy #1b2540 or #2d1b3d) at 70–85% opacity with a standard backdrop-filter: blur().
Borders: static 1px hairline borders using neutral structural colors (Fog Border / Ash Medium). No gradient borders, except as a micro-interaction indicator (e.g. a focused input or an active-state entity).
Buttons:

Primary: at most one active gradient-filled button per context/layout, reserved for the primary action.
Secondary/micro actions (edit, delete, cancel, navigation): static solid tones, neutral wireframes, or ghost components — minimize visual noise.

Typography: no gradient text. Titles use high-contrast flat colors (Pure Surface / Ice Veil); descriptive text uses eye-strain-reducing mid-tones (Slate Ink / Storm Gray).

4. Code Generation Quality Standards

TypeScript: every added parameter, function, or hook payload must be strictly typed. Avoid any. Use optional chaining (?.) when unwrapping deeply nested auth configs or store instances.
Next.js: honor the existing 'use client' allocation strategy — keep client-only state transformations inside localized client modules rather than adding client hooks to shared/server layout trees.
