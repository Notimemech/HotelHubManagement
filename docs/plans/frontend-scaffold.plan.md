# Plan: Frontend Scaffolding — HotelHubManagement

## Stack & Constraints
- Framework: Next.js 16 (App Router) + React 19 + TypeScript (existing in `frontend/`).
- CSS: Tailwind CSS v4 (existing).
- State: React Context for auth. Native fetch.
- Add only 2 runtime deps: `lucide-react` and `jwt-decode`.

## Files to Create / Modify
```
frontend/
├── app/
│   ├── layout.tsx                # Root layout (mount AuthProvider)
│   ├── page.tsx                  # Landing page (/) — RSC + small client sections
│   ├── login/page.tsx            # Login — client component
│   ├── register/page.tsx         # Register — client component
│   ├── admin/page.tsx            # Stub "Admin Area"
│   ├── tasks/page.tsx            # Stub "Tasks"
│   └── components/
│       ├── Navbar.tsx
│       ├── LandingHero.tsx
│       ├── LandingRooms.tsx
│       ├── LandingServices.tsx
│       ├── Footer.tsx
│       └── Spinner.tsx
└── lib/
    ├── auth-context.tsx          # useAuth() exposing { user, login, register, logout }
    └── api.ts                    # apiRequest() wrapper injecting Bearer + baseURL
frontend/.env.example            # NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Auth State Strategy (lib/auth-context.tsx)
- JWT stored in `localStorage` under `token`.
- On mount, decode JWT payload (`jwt-decode`) to populate `user = { accountId, username, role }` or null.
- `login(username, password)` calls `POST {API_BASE}/auth/login`. API_BASE = `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'`.
- `register(fields)` calls `POST {API_BASE}/auth/register`.
- On login success: store token + decode JWT, push route by role.
- `logout()` clears localStorage, push `/login`.

## Auth API Wrappers (lib/api.ts)
- `apiRequest(path, options)`: sets `Content-Type: application/json`; if `localStorage.token` exists sets `Authorization: Bearer <token>`; baseURL from `NEXT_PUBLIC_API_URL`; throws Error with backend `message` on non-2xx.

## Page UI Specs
### Landing (app/page.tsx)
- Server Component shell rendering Navbar, LandingHero, LandingRooms, LandingServices, Footer.
- Navbar: brand "HotelHub"; links (Phòng, Dịch vụ, Liên hệ) right-aligned; auth-aware CTA "Đăng nhập" or "Tài khoản ▼" w/ "Đăng xuất".
- LandingHero: full-screen bg image (unsplash), heading "Trải Nghiệm Kỳ Nghỉ Sang Trọng Tại HotelHub", CTA "Đặt phòng ngay" (push /login if not authed else /rooms).
- LandingRooms: 3 cards (Deluxe Ocean / Presidential Suite / Executive Suite) image, type, price, max guests.
- LandingServices: 4-icon grid (Infinity Pool/Waves, Spa & Wellness/Sparkles, Fine Dining/UtensilsCrossed, 24/7 Butler/Headphones).
- Footer: "123 Nguyễn Huệ, Quận 1, TP. HCM", "+84 28 1234 5678", © 2026 HotelHub.

### Login (app/login/page.tsx)
- 'use client'. Split-screen: left hotel photo, right centered card.
- Fields username (required), password (required). Submit → useAuth().login. Inline error. Spinner while pending.
- Bottom link: "Chưa có tài khoản? Đăng ký ngay" → /register.

### Register (app/register/page.tsx)
- 'use client'. Centered card.
- Fields: username (required), fullName (required), email (optional+regex), phone (optional+digits), password (required min 6), confirmPassword (required, match).
- Bottom link "Đã có tài khoản? Đăng nhập" → /login.
- Register returns {message, customerId} (no token) → redirect /login with success banner.

## Post-Login Role-Based Redirect
- User (Customer) → `/`.
- Manager / Receptionist / Saler → `/admin` (stub).
- Cleaner / Maintainer → `/tasks` (stub).
- Fallback → `/`.

## Constraints / SKIPPED (YAGNI)
- No OAuth, no multi-step registration, no password reset, no OTP, no profile editor, no CSS-in-JS.
- No react-hook-form/zod — inline validation only.
- No new deps beyond lucide-react + jwt-decode.
- Backend DTOs camelCase; use lowercase fetch fields (username, password, fullName, email, phone).
- images.unsplash.com added to next.config remotePatterns if missing. No other image domains.
- Write 0 test files. Manual smoke by user.

## Verification
- `cd frontend && npm run build` must be clean.

## Deliverables
- All listed files created with full content.
- `frontend/.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:3000`.
