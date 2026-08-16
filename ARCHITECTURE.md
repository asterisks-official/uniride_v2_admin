# Architecture — UniRide Admin

How this panel is put together, and where to put the next thing you write.

---

## The one rule

**The browser never sees the backend.** Every request goes through four layers,
and nothing skips one:

```
Component  →  APIKit (axios, baseURL '/api')  →  Next route handler  →  real backend
             src/apikit/                         src/app/api/[...path]   src/server/
```

The real origin lives in `API_URL`, server-only. There is deliberately no
`NEXT_PUBLIC_*` variable for it. `src/config/env.ts` is marked `server-only`, so
importing it from a client component is a build error rather than a leak.

Verify it holds:

```bash
npm run build
grep -r "localhost:3000\|api/v1" .next/static/   # must return nothing
```

---

## Folder map

```
src/
├── app/                    thin — routing, metadata, layout only
│   └── api/
│       ├── [...path]/      the proxy: allowlist → attach token → forward
│       └── auth/[...nextauth]/
├── apikit/                 the ONLY client-side network code
│   ├── client.ts           one axios instance, baseURL '/api', error normaliser
│   ├── types.ts            ApiResponse<T>, Paginated<T,K>, ApiError
│   └── <domain>/           .api.ts · .types.ts · .keys.ts · index.ts
├── features/<feature>/     everything used by exactly one feature
│   ├── components/  modals/  hooks/  schemas/  utils.ts
│   └── index.ts            the feature's only public surface
├── components/
│   ├── ui/                 design-system primitives (shadcn over Base UI)
│   ├── shared/             used by 2+ features
│   ├── layout/             sidebar, shells
│   └── icons/              the single icon barrel
├── config/                 env · permissions · nav
├── hooks/                  generic (useTableParams)
├── lib/                    cn, formatters
├── providers/              session · query client · toaster
├── server/                 server-only: backend client, allowlist, session
└── types/
```

---

## Where do I put X?

| X | Goes in | Why |
|---|---|---|
| A component one feature uses | `features/<f>/components/` | No exceptions. If it moves to a second feature, promote it |
| A component two features use | `components/shared/` | |
| A button, input, dialog | `components/ui/` | Design-system level |
| A network call | `apikit/<domain>/<domain>.api.ts` | Enforced by ESLint — nowhere else |
| A TanStack Query hook | `features/<f>/hooks/` | Wraps APIKit; never calls axios itself |
| A form schema | `features/<f>/schemas/` | zod, paired with react-hook-form |
| A permission | `config/permissions.ts` | Then guard the route *and* the UI |
| An icon | `components/icons/index.tsx` | Import from `@/components/icons`, never the package |
| Something touching the real backend | `server/` | Only place that knows `API_URL` |
| A page | `app/**/page.tsx`, ~10 lines | Metadata + `<Suspense>` + the feature's view |

---

## Adding a new endpoint, end to end

Four edits.

**1. Allow the path** — `src/server/api-allowlist.ts`:

```ts
{ method: 'GET', pattern: 'admin/reports' },
```

Matched on method *and* path, so allowing `GET` does not allow `DELETE`. A path
that is not listed returns 404, not 403 — a forbidden path should not be
distinguishable from a missing one.

**2. Type it and call it** — `src/apikit/reports/`:

```ts
// reports.types.ts
export interface Report { id: string; /* … */ }
export type ReportList = Paginated<Report, 'reports'>;

// reports.api.ts
export function getReports(
  query: ReportsQuery = {},
): Promise<AxiosResponse<ApiResponse<ReportList>>> {
  return apiClient.get('/admin/reports', { params: query });
}

// reports.keys.ts
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (q: ReportsQuery) => [...reportKeys.lists(), q] as const,
};
```

**3. Wrap it in a hook** — `src/features/reports/hooks/use-reports.ts`:

```ts
export function useReports(query: ReportsQuery) {
  return useQuery({
    queryKey: reportKeys.list(query),
    queryFn: async () => (await getReports(query)).data.data,
  });
}
```

**4. Render it.** Page stays thin; the view lives in the feature.

> Do not invent endpoints. Check `admin.controller.ts` for the real path, method
> and body shape — `ADMIN_SPEC.md` documents several that do not exist.

---

## Adding a new feature

```
src/features/<name>/
  components/   modals/   hooks/   schemas/   utils.ts   index.ts
```

1. `index.ts` exports only what other code may use. Nothing outside the feature
   imports past it.
2. Add the route to `config/nav.ts` and its permission to
   `config/permissions.ts` — both `PERMISSIONS` and `ROUTE_PERMISSIONS`.
3. Create `app/(dashboard)/<name>/page.tsx`: metadata, `<Suspense>`, the view.
4. `npm run build && npx tsc --noEmit && npx next lint` — all three, before moving on.

---

## Auth and RBAC

Sign-in posts to the backend inside NextAuth's `authorize()`, server-side. Both
backend tokens are stored in the encrypted JWT and **never** on the session
object — `getSession()` hands the session to page scripts, so anything on it is
readable by any script on the page. The proxy reads the token with
`getToken({ req })` and attaches it.

Access tokens last 900s. The `jwt` callback refreshes 60s early using the stored
refresh token; if that fails it sets `error: 'RefreshFailed'` and middleware
routes to sign-in.

Permissions are enforced **twice, on purpose**:

- `middleware.ts` — route level, via `ROUTE_PERMISSIONS`.
- `<Can permission="…">` — UI level.

UI-only hides a button but leaves the route reachable by typing the URL.
Route-only leaves buttons on screen that fail when pressed. The backend's
`RolesGuard` is the real authority; these two are the interface.

---

## Conventions

- **No `any`.** Strict TS.
- **Toasts are central** — the APIKit interceptor toasts failures. Components do
  not. 401/403/404 are silent because the screen renders those states itself.
- **Table state lives in the URL** (`useTableParams`), so admin views are
  shareable and the back button works.
- **One form pattern**: react-hook-form + zod resolver.
- **Loading/empty/error** use `TableSkeleton`, `EmptyState`, `ErrorState`. No
  ad-hoc spinners.
- **Icons** come from `@/components/icons`. Swapping the free set for Pro, or
  stroke-rounded for duotone, is an edit to one import block in that file.

ESLint enforces the network and icon boundaries via
`@typescript-eslint/no-restricted-imports`, with `allowTypeImports` so
`import type { AxiosResponse }` still works.

---

## Local setup

```bash
cp .env.example .env.local     # then set NEXTAUTH_SECRET
npm install
npm run dev                    # http://localhost:3001
```

Needs the backend running (`uniride_v2_backend`, `docker compose up -d`) and an
account with role `ADMIN` or `SUPER_ADMIN`. To promote one:

```bash
docker compose exec -T postgres psql -U postgres -d uniride_dev \
  -c "UPDATE users SET role='ADMIN' WHERE email='you@diu.edu.bd';"
```

`API_URL` is server-only. If you ever find yourself wanting a `NEXT_PUBLIC_`
version of it, the answer is a new entry in the allowlist instead.
