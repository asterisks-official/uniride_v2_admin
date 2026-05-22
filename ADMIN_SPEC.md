# UniRide Admin Dashboard — Project Specification & Implementation Plan

## Overview

The UniRide Admin Dashboard is a **Next.js 14** internal web application used by UniRide staff to manage rider verifications, handle safety reports, manage users, configure the platform, and monitor analytics. It is not publicly accessible — admin and super_admin accounts only.

- **Local Dev**: `http://localhost:3001`
- **Production**: `https://admin.uniride.app`
- **Backend**: UniRide API at `https://api.uniride.app/api/v1`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Auth | NextAuth.js (JWT strategy) |
| HTTP Client | Axios with auth interceptor |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| Type Safety | TypeScript strict mode |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx               → Login form
│   ├── (dashboard)/
│   │   ├── layout.tsx                 → Sidebar + main layout
│   │   ├── dashboard/
│   │   │   └── page.tsx               → KPI cards + charts
│   │   ├── verifications/
│   │   │   ├── page.tsx               → Verification queue table
│   │   │   └── [id]/page.tsx          → Single verification detail
│   │   ├── reports/
│   │   │   ├── page.tsx               → Reports queue table
│   │   │   └── [id]/page.tsx          → Single report detail
│   │   ├── users/
│   │   │   ├── page.tsx               → User search + table
│   │   │   └── [id]/page.tsx          → User profile + actions
│   │   ├── rides/
│   │   │   └── page.tsx               → Ride analytics
│   │   ├── config/
│   │   │   └── page.tsx               → App config key-value editor
│   │   └── audit-log/
│   │       └── page.tsx               → Admin action log
│   ├── api/
│   │   └── auth/[...nextauth]/
│   │       └── route.ts               → NextAuth handler
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                            → shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx                → Navigation sidebar
│   │   └── header.tsx                 → Top bar with user menu
│   ├── charts/
│   │   ├── rides-chart.tsx            → Line chart: rides over time
│   │   ├── users-chart.tsx            → Bar chart: registrations
│   │   └── reports-chart.tsx          → Pie chart: report types
│   └── tables/
│       ├── verifications-table.tsx    → TanStack Table
│       ├── reports-table.tsx
│       └── users-table.tsx
├── lib/
│   ├── api.ts                         → Axios client + interceptor
│   ├── auth.ts                        → NextAuth config
│   └── utils.ts                       → cn(), formatDate(), etc.
└── types/
    ├── next-auth.d.ts                 → Session type extensions
    └── api.ts                         → API response types
```

---

## Authentication Flow

```
1. Admin navigates to any protected route
2. Middleware checks for valid NextAuth session
3. No session → redirect to /login
4. Login page calls NextAuth CredentialsProvider
5. NextAuth calls backend POST /auth/login
6. On success: backend returns { accessToken, user }
7. NextAuth stores accessToken in JWT cookie (httpOnly)
8. All Axios requests attach Authorization: Bearer <accessToken>
9. On 401: NextAuth session cleared → redirect to /login
```

### Middleware (route protection)

```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/((?!login|api/auth|_next).*)'],
};
```

---

## Pages Specification

### Dashboard `/dashboard`

**Purpose**: At-a-glance platform health.

**Components**:
- 4 KPI cards: Total Users, Active Rides Today, Pending Verifications, Open Reports
- Line chart: Rides completed per day (last 30 days) — Recharts
- Bar chart: New user registrations per day (last 30 days)
- Recent activity feed (last 5 admin actions from audit log)

**API calls**:
- `GET /admin/analytics`

---

### Verifications `/verifications`

**Purpose**: Approve or reject rider verification requests.

**Components**:
- TanStack Table with columns: Name, University, Vehicle, Submitted Date, Status chip, Actions
- Filters: status (pending/approved/rejected), university
- Row click → opens `Sheet` (slide-over) with full detail:
  - License photo (zoomable)
  - Vehicle photo
  - Student ID photo
  - Vehicle info (make, model, year, color, plate)
- Approve button → confirmation `AlertDialog` → `PATCH /admin/verifications/:id` with `{ status: 'APPROVED' }`
- Reject button → `Dialog` with required note input → `PATCH /admin/verifications/:id` with `{ status: 'REJECTED', adminNote }`
- Toast on success/failure

**API calls**:
- `GET /admin/verifications?status=PENDING&page=1&limit=20`
- `PATCH /admin/verifications/:id`

---

### Reports `/reports`

**Purpose**: Handle safety and moderation reports.

**Components**:
- TanStack Table: Reporter, Reported User, Type, Severity badge (color-coded), Status, Date
- Severity colors: LOW (gray), MEDIUM (yellow), HIGH (orange), CRITICAL (red)
- Filters: severity, status, type
- Row detail panel:
  - Description
  - Links to reporter and reported user profiles
  - Related ride link (if applicable)
- Action buttons: Mark Resolved, Escalate, Dismiss
- Each action writes to AuditLog

**API calls**:
- `GET /admin/reports?severity=HIGH&status=OPEN`
- `PATCH /admin/reports/:id`

---

### Users `/users`

**Purpose**: Search, view, and manage user accounts.

**Components**:
- Search bar (debounced, 300ms) — searches by name, email, university
- TanStack Table: Avatar, Name, Email, University, Role, Trust Score, Status, Joined
- Click row → User detail `Sheet`:
  - Profile info
  - Stats (rides completed, avg rating, cancellations)
  - Ride history (last 5 rides)
  - Suspension toggle with reason input
  - "View Verifications" link (for riders)
- Suspend button → `AlertDialog` with reason input → `PATCH /admin/users/:id/suspend`
- Unsuspend → same endpoint with `{ isSuspended: false }`

**API calls**:
- `GET /admin/users?search=shakib&page=1&limit=20`
- `PATCH /admin/users/:id/suspend`

---

### Config `/config`

**Purpose**: Edit runtime feature flags and platform settings.

**Key-value pairs managed**:

| Key | Type | Description |
|---|---|---|
| `maintenance_mode` | boolean | Put app in maintenance mode |
| `university_allowlist` | string[] | Allowed universities for registration |
| `max_fare_bdt` | number | Maximum allowed fare |
| `min_fare_bdt` | number | Minimum allowed fare |
| `ride_expiry_minutes` | number | Minutes until unmatched ride expires |
| `otp_expiry_minutes` | number | OTP validity window |
| `trust_score_min_rides` | number | Rides needed before trust score kicks in |

**Components**:
- JSON-aware key-value editor (each row: key label, input field, type badge)
- "Save Changes" → confirmation `AlertDialog` → `PATCH /admin/config`
- Changes written to AuditLog by backend

**API calls**:
- `GET /admin/config`
- `PATCH /admin/config`

---

### Audit Log `/audit-log`

**Purpose**: Read-only log of all admin actions for accountability.

**Components**:
- TanStack Table: Admin, Action, Target Type, Target ID, Timestamp
- Filter by admin, action type, date range
- Click row → expandable `before`/`after` JSON diff view
- Export to CSV button

**API calls**:
- `GET /admin/audit-log?page=1&limit=50`

---

## Component Patterns

### Data Table with TanStack

```typescript
// components/tables/verifications-table.tsx
export function VerificationsTable({ data }: { data: Verification[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>...</TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} onClick={() => onRowClick(row.original)}>
              ...
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
```

### Server-side data fetching (App Router)

```typescript
// app/(dashboard)/verifications/page.tsx
export default async function VerificationsPage() {
  const session = await getServerSession(authOptions);
  const data = await fetch(`${process.env.API_URL}/admin/verifications`, {
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    cache: 'no-store',
  }).then(r => r.json());

  return <VerificationsTable data={data.data} />;
}
```

### Axios client (client-side mutations)

```typescript
// Approve verification (client component)
const handleApprove = async (id: string) => {
  try {
    await api.patch(`/admin/verifications/${id}`, { status: 'APPROVED' });
    toast.success('Rider approved successfully');
    router.refresh(); // revalidate server component data
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Failed to approve');
  }
};
```

---

## API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta: { requestId: string; timestamp: string };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: { page: number; limit: number; total: number };
}

export interface User {
  id: string;
  email: string;
  name: string;
  university: string;
  role: 'PASSENGER' | 'RIDER' | 'ADMIN' | 'SUPER_ADMIN';
  isSuspended: boolean;
  createdAt: string;
  stats?: UserStats;
}

export interface Verification {
  id: string;
  userId: string;
  user: Pick<User, 'name' | 'email' | 'university'>;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  licenseDocUrl: string;
  vehiclePhotoUrl: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Report {
  id: string;
  reporter: Pick<User, 'id' | 'name'>;
  reported: Pick<User, 'id' | 'name'>;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  description: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalRides: number;
  activeRidesToday: number;
  pendingVerifications: number;
  openReports: number;
  ridesPerDay: { date: string; count: number }[];
  usersPerDay: { date: string; count: number }[];
}
```

---

## Implementation Phases

### Phase 1 — Skeleton (Week 3–4)
- [ ] `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- [ ] `middleware.ts` — protect all non-auth routes
- [ ] `components/layout/header.tsx` — top bar with user avatar + sign out
- [ ] All remaining route shell pages with placeholder content
- [ ] `types/api.ts` — complete type definitions

### Phase 2 — Auth (Week 5–6)
- [ ] `app/(auth)/login/page.tsx` — email + password form with shadcn Input + Button
- [ ] Client-side form validation (required fields, email format)
- [ ] `signIn('credentials', ...)` call on submit
- [ ] Error display on invalid credentials
- [ ] Redirect to `/dashboard` on success

### Phase 5 — All Dashboard Pages (Week 13–14)
- [ ] `DashboardPage` — fetch analytics, render KPI cards + Recharts line/bar charts
- [ ] `VerificationsPage` — TanStack table, Sheet detail view, Approve/Reject with AlertDialog
- [ ] `ReportsPage` — TanStack table, severity badges, action workflow
- [ ] `UsersPage` — debounced search, user detail Sheet, suspend/unsuspend
- [ ] `ConfigPage` — dynamic key-value form, save with confirmation
- [ ] `AuditLogPage` — read-only table with JSON diff expansion
- [ ] All pages: loading skeletons (`Skeleton` component), error boundaries, empty states
- [ ] Toast notifications on all mutations (Sonner)

---

## UI Standards

```
Color palette (Tailwind CSS):
  Primary:     blue-600 (#2563EB)
  Danger:      red-500  (#EF4444)
  Warning:     amber-500 (#F59E0B)
  Success:     emerald-500 (#10B981)
  Background:  gray-50  (#F9FAFB)
  Border:      gray-200 (#E5E7EB)

Typography:
  Heading 1:   text-2xl font-bold text-gray-900
  Heading 2:   text-lg font-semibold text-gray-900
  Body:        text-sm text-gray-600
  Muted:       text-xs text-gray-400

Spacing: 8px grid (p-2, p-4, p-6, p-8)
Border radius: rounded-lg (8px) for cards, rounded-md for inputs
```

---

## Environment Variables

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<random 32+ char string>
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1   # client-side
API_URL=http://localhost:3000/api/v1                # server-side
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Running the Admin

```bash
npm install
npm run dev     # http://localhost:3001

npm run build   # production build
npm run start   # run production build
npm run lint    # ESLint check
```
