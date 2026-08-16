# Follow-ups

Deferred bugs, tech debt and open questions found during the migration. Nothing
here was silently fixed along the way.

---

## Bugs found, not fixed

### B1 · `GET /admin/riders/pending` is now a misnomer — **low**

The endpoint accepts `?status=APPROVED|REJECTED`, so a path ending `/pending`
now serves things that are not pending. Renaming to `GET /admin/riders?status=`
is the honest shape and would break nothing — this panel is its only consumer.
Left alone because the approved change was "add a status param", not a rename.

### B2 · Backend `verifyRider` does not reject a decision on an already-decided
profile — **medium**

`PATCH /admin/riders/:userId/verify` will happily reject a profile that is
already `REJECTED`, incrementing `rejectionCount` again. Two admins reviewing the
same queue entry can therefore burn two of the applicant's three attempts for one
mistake, and a double-click may do it single-handedly.

The UI only offers the buttons on `PENDING`, so this is not reachable through the
panel today — but it is reachable through the API, and the consequence is a
permanent account ban. Worth a status guard in the service.

### B3 · No optimistic concurrency on the queue — **low**

Two admins with the queue open both see an entry; the second decision silently
overwrites the first. The invalidation on success keeps a single admin's view
honest but does nothing across sessions. Needs either a `reviewedAt` precondition
or realtime invalidation.

### B4 · `ADMIN_SPEC.md` is partly wrong — **medium (documentation)**

Beyond the endpoint drift in `ARCHITECTURE_AUDIT.md` F6, it mandates
`NEXT_PUBLIC_API_URL`, which this architecture forbids. It now describes neither
the backend nor the frontend accurately. Question Q5 in the audit is still
unanswered: rewrite, mark superseded, or keep as product intent?

---

## Tech debt

### D1 · HugeIcons **free** set, not Pro

Per your answer to Q1. The Pro registry token was not available, so
`src/components/icons/index.tsx` imports `@hugeicons/core-free-icons`. That file
exists precisely so the swap is one import block — no call site changes. When the
token arrives: add `.npmrc` reading it from env, install
`@hugeicons-pro/core-stroke-rounded`, change the import, run
`npx tsc --noEmit` to catch any name that differs between the sets.

### D2 · shadcn primitives are generated React-19 style, on a React-18 project

`Input` was a plain function component. On React 19 a `ref` arrives as an
ordinary prop and that is fine; on React 18 it is silently dropped. So
`{...register('email')}` attached nothing, the login form read every field as
`undefined`, and zod rejected valid input with "Invalid input" — with no warning
from typecheck, lint or build.

Fixed on `Input` (the only one a form spreads `register()` onto today). Every
other primitive in `components/ui/` is also a plain function: they wrap Base UI
components, which handle their own refs, so nothing is broken right now. But any
new form control needs `forwardRef` adding before `register()` is spread onto it.

Either upgrade to React 19 so the generated style is correct, or add `forwardRef`
as you touch each one.

### D3 · No shared `DataTable` yet

The pilot renders `components/ui/table` directly with a `useTableParams` hook for
URL state. That was the right call for one feature — a generic DataTable
abstracted from a single caller usually fits nothing else. Build it when the
second table (Users) lands and the real shared surface is visible: server-side
sort and column filtering are not exercised by the verification queue.

### D4 · `@tanstack/react-table` installed but unused

It came with the scaffold. Either it becomes the basis of D2 or it should be
removed.

### D5 · Six sidebar links still 404

`/reports`, `/users`, `/rides`, `/config`, `/audit-log` have nav entries and
permissions but no pages. Middleware protects them; they just do not exist yet.
Consider hiding entries whose feature is unbuilt, or shipping a placeholder.

### D6 · No test suite

There is no test runner in this project at all. The pilot's `utils.ts`
(`attemptsLeft`, `isFinalRejection`) and `server/api-allowlist.ts` (`isAllowed`)
are pure functions guarding real consequences — a permanent ban and the request
boundary respectively — and are the obvious first things to cover.

Raised in priority by D2: typecheck, lint and build all passed on a login form
that could not be submitted. Only rendering it would have caught that, and
nothing in this project renders anything.

### D7 · Document images bypass the Next image optimizer

`unoptimized` is set on identity documents deliberately: routing private licence
and student-ID photos through this server's optimizer would cache them on the
panel's infrastructure. The consequence is no resizing, so a large photo is
downloaded at full size. If it becomes a problem, the fix is a signed thumbnail
from the CDN, not turning the optimizer on.

---

## Open questions

### Q3 · Icon style variant — assumed, not confirmed

Unanswered, so I used my recommendation: **stroke-rounded** equivalents from the
free set, which read best at 16–20px in dense tables. Changing it is one import
block.

### Q4 · Does the panel need its own login long-term, or SSO?

Phase 2 built a credentials form. If SSO is coming, the NextAuth provider swaps
and nothing else changes.

### Q5 · What happens to `ADMIN_SPEC.md`? (see B4)

### Q6 · Should approved/rejected rows be *editable*?

The tabs are read-only today. Reversing a wrong approval — revoking a rider — is
a real admin need, and `verifyRider` already supports it (approving sets
`role=RIDER`, rejecting sets it back). Not built because it was not asked for,
and because "revoke a rider" deserves its own confirmation copy rather than
reusing the reject dialog.

### Q7 · Who is allowed to decide verifications?

Currently both `ADMIN` and `SUPER_ADMIN` hold `verifications.decide`. Given the
third rejection permanently bans an account, you may want the final rejection
restricted to `SUPER_ADMIN`, or a two-person rule. That is a policy call.

---

## Not done from the original brief

- **Features 6–9** (Users, Reports, Dashboard, Rides/Config/Audit) — the pilot is
  the reference implementation they follow.
- **Refresh-on-401 in `backend-client.ts`** — refresh is handled in the NextAuth
  `jwt` callback instead, which is where the refresh token lives. A second
  refresh path in the axios instance would race with it.
