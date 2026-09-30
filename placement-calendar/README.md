# 📅 Placement Drive Calendar PWA

A production-ready, mobile-first Progressive Web App for campus placement drive scheduling.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase SSR · Lucide React

---

## 🚀 Quick Start

### 1. Install Node.js

Download and install Node.js 20 LTS from [nodejs.org](https://nodejs.org/).
After installation, restart your terminal.

### 2. Install Dependencies

```bash
cd d:\AntiGGGG\placement-calendar
npm install
```

### 3. Set Up Supabase Database

Go to your Supabase project → **SQL Editor** → Run `supabase/migrations/001_initial.sql`.

This creates:
- `profiles` table (linked to auth.users, stores `role`: `admin` | `coordinator`)
- `drives` table (all drive records with status: `tentative` | `fixed` | `cancelled`)
- Row Level Security policies
- Auto-profile trigger (creates a profile on sign-up)

### 4. Create Users

In Supabase Dashboard → **Authentication → Users** → Invite users:
- 2 admin users (Placement Leads)
- 11 coordinator users (Placement Coordinators)

Then set their roles in **Table Editor → profiles**:
```sql
UPDATE profiles SET role = 'admin' WHERE email IN ('lead1@college.edu', 'lead2@college.edu');
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it auto-redirects to `/login`.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🏗 Project Structure

```
placement-calendar/
├── app/
│   ├── (auth)/login/        # Login page (Supabase email+password)
│   ├── (app)/               # Protected app shell
│   │   ├── layout.tsx       # Auth guard + Navbar
│   │   └── page.tsx         # Home → CalendarShell
│   ├── globals.css          # MongoDB design tokens + utility classes
│   └── layout.tsx           # Root layout (PWA meta, font)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       # Dark-teal sticky nav with role badge
│   └── calendar/
│       ├── CalendarShell.tsx    # Tab orchestrator (Fixed/Tentative/All)
│       ├── MonthView.tsx        # 6-week month grid
│       ├── WeekView.tsx         # 7-column week layout
│       ├── DriveGrid.tsx        # Excel-style sortable table
│       ├── DriveListPopover.tsx # Date drive list bottom sheet
│       ├── DriveModal.tsx       # Add/Edit modal with permission matrix
│       └── StatusBadge.tsx      # Status chip component
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client (SSR)
│   │   └── middleware.ts    # Session refresh + route guard
│   ├── actions/drives.ts    # Server Actions (CRUD + admin actions)
│   ├── hooks/
│   │   ├── useDrives.ts     # Drives hook with real-time subscription
│   │   └── useProfile.ts    # Current user profile hook
│   └── utils/
│       ├── calendar.ts      # Month/week grid generators, date helpers
│       └── cn.ts            # clsx + tailwind-merge utility
├── types/index.ts           # All TypeScript types
├── middleware.ts             # Next.js route middleware
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/              # App icons (SVG)
└── supabase/
    ├── migrations/001_initial.sql  # Schema + RLS
    └── seed.sql                    # Sample data instructions
```

---

## 🎨 Design System

Styled using **MongoDB design tokens** from `DESIGN-mongodb.md`:

| Token | Value | Use |
|-------|-------|-----|
| `brand-teal-deep` | `#001e2b` | Navbar, hero bands |
| `brand-green` | `#00ed64` | Primary CTA buttons |
| `brand-green-dark` | `#00684a` | Links, active states |
| `canvas` | `#ffffff` | Card backgrounds |
| `surface-feature` | `#e3fcef` | Empty date highlight |

Font: **Plus Jakarta Sans** (nearest free alternative to Euclid Circular A)

---

## 👤 Role Permissions

| Action | Coordinator | Admin |
|--------|-------------|-------|
| View all active drives | ✅ | ✅ |
| Create tentative drive | ✅ | ✅ |
| Edit own tentative drive | ✅ | ✅ |
| Delete own tentative drive | ✅ | ✅ |
| View fixed drive details | ✅ (read-only) | ✅ |
| Confirm & Fix date | ❌ | ✅ |
| Revert Fixed → Tentative | ❌ | ✅ |
| Cancel drive | ❌ | ✅ |
| Edit any drive | ❌ | ✅ |

---

## 📱 PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap ⋮ menu → **Add to Home screen**

### iOS (Safari)
1. Open in Safari
2. Tap Share → **Add to Home Screen**

The app will launch in standalone mode with the dark teal status bar.

---

## 🗓 Target Date Range

**January 1, 2026 – June 30, 2027** (18 months of placement drives)

All calendar navigation is bounded to this range.

---

## 🔄 Real-time Updates

Drives update in real-time across all connected clients using **Supabase Realtime** (`postgres_changes`). No manual refresh needed.

---

## 🛠 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://ayvzylivoedsuirgtgyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_UP8VzLI_KPr5I29vjWfhMw__6XgplZO
```

Both are already set in `.env.local`.

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add the env variables in the Vercel dashboard under **Settings → Environment Variables**.
