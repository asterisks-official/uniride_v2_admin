# Architecture Audit — UniRide Admin

Phase 0 output. Read from source on branch `main` @ `825971c`. No code changed.

---

## 0. Context (filled in from the repo)

| | |
|---|---|
| Repo root | `uniride_v2_admin` |
| Framework | **Next.js 14.2.35**, App Router (the brief assumed 15.x — it is 14) |
| Backend API | `http://localhost:3000/api/v1` in dev; `https://api.uniride.app/api/v1` per spec |
| Auth scheme | NextAuth Credentials + JWT strategy — **configured but not mounted** (see F2) |
| Data layer | None. `@tanstack/react-table` is installed; **TanStack Query is not** |
| Package manager | **npm** (`package-lock.json`, no pnpm/yarn lockfile) |
| UI primitives | shadcn `base-nova` style over **Base UI** (`@base-ui/react`), not Radix |
| Size | 24 source files, ~1,679 lines |

**Baseline is green**: `next build`, `tsc --noEmit` and `next lint` all pass today. That is
the bar every migration step must keep.

---

## 1. Current tree

```
src/
├── app/
│   ├── page.tsx                 ← stock Next.js starter page (dead scaffold)
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/login/page.tsx    ← placeholder, no form
│   └── (dashboard)/
│       ├── layout.tsx           ← sidebar + main
│       └── dashboard/page.tsx   ← placeholder
├── components/
│   ├── layout/sidebar.tsx       ← 7 nav items, 6 route to pages that do not exist
│   └── ui/                      ← 12 shadcn primitives
├── lib/
│   ├── api.ts                   ← axios client — DEAD, imported nowhere
│   ├── auth.ts                  ← NextAuth options — DEAD, never mounted
│   └── utils.ts                 ← cn()
└── types/next-auth.d.ts
```

There are **no** feature folders, no `src/app/api/**`, no `middleware.ts`, no providers,
no hooks, no config, no server layer. This is a scaffold, not a partial implementation —
which makes it a good moment to impose the target architecture, since almost nothing has
to be un-built.

---

## 2. Every place a network call is made

Two, and **both are dead code**.

| Location | Call | Reachable from browser? | Verdict |
|---|---|---|---|
| `src/lib/api.ts:5` | axios instance → `NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'` | Yes, by design — client-side axios | **Violates the BFF rule** |
| `src/lib/auth.ts:23` | `axios.post(`${process.env.API_URL}/auth/login`)` | No — runs in `authorize()` on the server | Correct today; moves to `src/server/` |

No component imports either module. Nothing in the app currently performs a network
request at all.

---

## 3. Findings

Severity is about consequence if shipped, not effort.

### F1 · The client axios instance is built to leak the backend — **high**

`src/lib/api.ts` reads `NEXT_PUBLIC_API_URL`, which is inlined into the client bundle by
definition, and falls back to a hardcoded `http://localhost:3000/api/v1`. `ADMIN_SPEC.md`
documents `NEXT_PUBLIC_API_URL` as a required variable, so this is the intended design,
not an accident.

Nothing leaks *today* only because the module is unimported and tree-shaken out. The
moment one component imports it, the real backend origin ships to the browser.

> Verified: `grep -ro "localhost:3000/api/v1" .next/` returns nothing in the current build.

### F2 · NextAuth is configured but never mounted — **high**

`authOptions` exists in `src/lib/auth.ts`; `src/app/api/auth/[...nextauth]/route.ts` does
not. There is no handler at `/api/auth/*`, so sign-in cannot work and no session is ever
issued. Auth is 0% functional despite looking complete.

### F3 · No route protection — **high**

No `middleware.ts`. `/dashboard` renders for anyone. The spec describes middleware at
`ADMIN_SPEC.md:100` but it was never written.

### F4 · The backend access token would be exposed to the browser — **high**

`lib/auth.ts` puts the backend `accessToken` into the NextAuth JWT, and `next-auth.d.ts`
re-exposes it on `Session`. `lib/api.ts` then reads it client-side via `getSession()`.

NextAuth's session cookie is itself httpOnly, but `getSession()` returns its decrypted
contents to client JavaScript — so the backend bearer token becomes readable by any script
on the page. The target architecture forbids this: the token must stay server-side and be
attached by the route handler.

### F5 · Refresh tokens are discarded — **medium**

`authorize()` destructures only `accessToken` from the login response. The backend also
returns `refreshToken`, and its access tokens expire in 900s (`JWT_ACCESS_TOKEN_TTL`).
An admin session therefore dies after 15 minutes with no recovery path — mid-review, on a
verification queue. Refresh-on-401 belongs in `src/server/backend-client.ts`.

### F6 · The spec documents endpoints that do not exist — **high (blocks the pilot)**

`ADMIN_SPEC.md:130-151` specifies the verification queue against:

```
GET   /admin/verifications?status=PENDING&page=1&limit=20
PATCH /admin/verifications/:id   { status: 'APPROVED' | 'REJECTED', adminNote }
```

Neither route exists. The backend actually serves:

```
GET   /admin/riders/pending?page&limit
PATCH /admin/riders/:userId/verify   { action: 'APPROVE' | 'REJECT', note? }
```

Note the differences: path, the id is a **userId** not a profile id, the field is `action`
not `status`, the values are `APPROVE`/`REJECT` not `APPROVED`/`REJECTED`, and the note key
is `note` not `adminNote`. Building from the spec would produce a panel that 404s on every
call. See §6 for what this costs the pilot.

### F7 · Icons: lucide-react in 6 files — **medium**

`lucide-react@1.16.0` is imported by `sidebar.tsx` and five UI primitives
(`dropdown-menu`, `dialog`, `sheet`, `select`, `sonner`). `components.json` also pins
`"iconLibrary": "lucide"`, so every future `shadcn add` re-introduces it. That line has to
change or the removal will not hold.

**HugeIcons Pro is not installed, and I cannot install it** — `@hugeicons-pro/*` returns
E404 without registry auth. `@hugeicons/react` (the `HugeiconsIcon` renderer) and
`@hugeicons/core-free-icons` are public. See blocking question Q1.

### F8 · No data layer — **medium**

No TanStack Query, no QueryClient, no providers directory. `@tanstack/react-table` is
installed but unused. The target (hooks wrapping APIKit) needs `@tanstack/react-query`
added.

### F9 · Dead scaffold at `/` — **low**

`src/app/page.tsx` is the untouched Next.js starter: 101 lines, and it hotlinks
`https://nextjs.org/icons/next.svg` — an external request from the admin panel's root
route. Should redirect to `/dashboard` or `/login`.

### F10 · Sidebar links to six routes that do not exist — **low**

`/verifications`, `/reports`, `/users`, `/rides`, `/config`, `/audit-log` all 404. Only
`/dashboard` resolves.

### F11 · `getPendingRiders` has no query DTO — **low, backend**

`admin.controller.ts:70` takes `@Query('page')` / `@Query('limit')` as raw untyped params
with no `ValidationPipe` DTO, unlike every other list endpoint. Out of scope for this
migration; recorded for `FOLLOW_UPS.md`.

### F12 · Duplicated components — **none found**

Too early in the build for duplication. Nothing to consolidate.

---

## 4. Route-handler strategy — recommendation

**Choose (b): typed catch-all proxy + allowlist.** `src/app/api/[...path]/route.ts`.

Reasoning specific to this codebase:

1. **Nine admin endpoints, all pass-through.** Not one needs request or response
   transformation. Explicit handlers would be nine near-identical files whose only
   difference is a string.
2. **The allowlist is itself a security control.** One typed const enumerating every
   backend path the browser may reach is auditable in a single glance. With per-endpoint
   files, a handler that quietly forwards something it should not is a code review away
   from being missed.
3. **Adding an endpoint becomes one line**, which matters because the remaining six
   features are all thin CRUD over an existing API.

Where (b) would be wrong — and where we override it per-endpoint — is anywhere a payload
needs reshaping or a response needs field-stripping. None of the nine qualify today. If
one appears, an explicit `route.ts` at a more specific path wins over the catch-all by
Next's routing precedence, so the two can coexist without refactoring.

The allowlist is matched on `METHOD + path pattern`, not path alone, so `GET /admin/users`
being permitted does not also permit `DELETE /admin/users/:id`.

---

## 5. Migration plan

Each phase ends with `typecheck && lint && build` green. No file is deleted until its
replacement is wired and building.

| # | Phase | Delivers | Touches |
|---|---|---|---|
| **1** | **Foundation — server layer & BFF** | `src/config/env.ts` (zod), `src/server/backend-client.ts`, `src/server/session.ts`, catch-all proxy + allowlist, NextAuth route handler (fixes F2), refresh-on-401 (F5), `.env.example` | new files only |
| **2** | **Auth & RBAC** | Working login form, `middleware.ts` route protection (F3), `src/config/permissions.ts`, `<Can>` guard, token moved out of the client session (F4) | `lib/auth.ts` → `server/`, login page |
| **3** | **Shared layers** | `apikit/client.ts` + types, QueryClient provider, `DataTable` (URL-param pagination/sort/filter), `PageHeader`, `ConfirmDialog`, `EmptyState`, skeletons, central toast in the error interceptor | new files |
| **4** | **Icons** | `@hugeicons/react` + chosen icon set, `src/components/icons/index.ts` barrel, all six lucide files converted, `components.json` `iconLibrary` changed, lucide uninstalled (F7) | 6 files + config |
| **5** | **PILOT — Rider approval** | Full vertical slice, reference implementation for everything after | new feature |
| **6** | Users | list, detail, suspend | |
| **7** | Reports | queue, resolve | |
| **8** | Dashboard | stats + charts | |
| **9** | Rides · Config · Audit log | remaining read-mostly views | |
| **10** | Cleanup | delete `lib/api.ts` (F1), fix `/` (F9), ESLint `no-restricted-imports`, `ARCHITECTURE.md` | |

Phases 1–4 are scaffolding the pilot cannot be built without — the pilot is the first thing
that proves them, which is why it comes fifth rather than first.

---

## 6. Pilot feature: **Rider approval** (`/verifications`)

You named user approval as the priority, and it also happens to be the right pilot: it is
the smallest **complete vertical slice** in the panel — list → detail → two mutations →
optimistic invalidation → toast — while touching every layer the architecture defines.

It is not textbook CRUD (no create, no delete), and I would rather pilot the feature you
actually need than a fuller-CRUD one you do not.

**What it exercises:** catch-all proxy · APIKit domain folder · TanStack Query hooks ·
shared `DataTable` with URL params · detail sheet · confirm dialog · required-note form
(react-hook-form + zod) · RBAC guard · toast · loading/empty/error states.

**Endpoints (real ones, per F6):**

```
GET   /admin/riders/pending?page&limit
PATCH /admin/riders/:userId/verify   { action: 'APPROVE' | 'REJECT', note?: string }
```

**What the queue row can show** — `getPendingRiders` returns the full `RiderProfile` plus
`user{id,name,email,university,createdAt}`, so: vehicle make/model/year/colour/plate,
`licenseDocUrl`, `vehiclePhotoUrl`, `licensePlatePhotoUrl`, `studentIdDocUrl`, `selfieUrl`,
`faceVerifiedAt`, `rejectionCount`, `createdAt`.

**Two things the UI must get right, because the backend now has teeth:**

1. **`rejectionCount` is a countdown to a permanent ban.** The third rejection suspends the
   account *and* blocklists its email, student ID and phone from ever registering again.
   The reject dialog must show attempts remaining and state plainly when the admin is about
   to issue the final one. An admin should never discover that consequence afterwards.
2. **The face-check selfie is the point of comparison.** `selfieUrl` exists to be held
   against `licenseDocUrl` and `studentIdDocUrl`. The detail view should place them
   together rather than in a list of thumbnails.

**Known limits, from the API rather than the UI** (detail in §7):

- The queue can only show **PENDING**. `getPendingRiders` hardcodes
  `where: { verificationStatus: 'PENDING' }`, so the spec's approved/rejected filter tabs
  are not buildable without a backend change.
- There is **no rider-detail endpoint**. The detail view must render from the list row.
- There is **no university filter** — `user.university` is free text, and scoping does not
  exist yet.

---

## 7. Open questions

Numbered for reply. **Q1 blocks Phase 4; Q2 blocks the pilot's filter tabs. The rest do
not block starting.**

**Q1 — HugeIcons Pro registry token.** `@hugeicons-pro/*` is 404 without auth, so I cannot
grep its exports to verify icon names, which the brief explicitly forbids guessing. Options:
(a) provide the token — I add `.npmrc` reading from env, never committed; (b) build the
barrel against the public `@hugeicons/core-free-icons` now and swap the import inside
`src/components/icons/index.ts` when the token arrives — the barrel exists precisely so
that swap is one file. Which?

**Q2 — Should the verification queue show approved/rejected too?** The spec asks for status
filter tabs; the endpoint cannot serve them. Either (a) pilot ships PENDING-only, or (b) I
add a `status` query param to `getPendingRiders` on the backend first. (b) is a ~10-line
backend change and I would recommend it, since a reviewer with no way to look up what they
decided yesterday will ask for it in week one.

**Q3 — Style variant.** One HugeIcons variant must be the default across the panel:
stroke-rounded, solid-rounded, or duotone. Stroke-rounded reads best at 16–20px in dense
admin tables; confirm or override.

**Q4 — Does the admin panel need its own login, or SSO later?** Affects whether Phase 2
invests in the credentials form or stays minimal.

**Q5 — `ADMIN_SPEC.md` is now partly wrong (F6, and it mandates `NEXT_PUBLIC_API_URL`
which the new architecture forbids).** Do you want it (a) rewritten to match, (b) marked
superseded by `ARCHITECTURE.md`, or (c) left as-is as a product-intent document?

---

## 8. Acceptance criteria — where we stand today

| Criterion | Now | After |
|---|---|---|
| No backend URLs or secrets in client bundles | ⚠️ Clean only because the module is dead | Enforced by BFF + `env.ts` |
| No network calls outside `apikit/` and `server/` | ⚠️ Vacuously true — there are none | Enforced by ESLint rule |
| Icons from HugeIcons Pro only | ✗ lucide in 6 files | Phase 4 |
| Single-feature components inside their feature | ⚠️ No features exist yet | Phases 5–9 |
| `build` / `typecheck` / `lint` clean | ✓ All three pass | Kept green per phase |

---

**Awaiting approval on §5 and §6, and answers to Q1–Q2, before any code is written.**
