# PLAN.md — Work Hours Manager (Technical Plan)

| | |
|---|---|
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 2026-06-18 |
| **Stage** | 2 of 5 (Technical Planning) — derived from `SPEC.md` v0.2 |

This document defines the technical design for the system specified in `SPEC.md` v0.2: stack, architecture, data model, calculation core, and phased delivery. Task breakdown is Stage 3 (`TASKS.md`).

---

## 1. Technology Stack

| Concern | Choice |
|---|---|
| Language | TypeScript |
| UI framework | React + Vite |
| Components & design | Material UI (MUI) |
| Calendar view | react-big-calendar (ready-made, MUI-styled) |
| Styling / RTL | Emotion (MUI default) + `stylis-plugin-rtl` |
| Cloud, database & auth | Supabase (Postgres, auth, RLS) |
| Server state & sync | TanStack Query |
| Routing | React Router |
| Date handling | date-fns |
| Hebrew text & RTL | Inline Hebrew strings + MUI RTL theme (no i18n library — see §10, OT-4) |
| Testing | Vitest + React Testing Library |
| Hosting | Netlify |

All services run on free tiers.

---

## 2. Architecture

A web application that opens in any modern browser (Chrome, Edge, Firefox, Safari) via a link — no installation. It is built as a React Single-Page Application and communicates directly with Supabase; there is no custom backend server. Supabase provides the database, authentication, and per-user data isolation.

```
┌─────────────────────────────────────────────┐
│      Web Browser — Chrome / Edge / Firefox   │
│                (React SPA)                   │
│  UI Layer (MUI screens/components — RTL/Heb) │
│  Domain Layer (pure calculation functions)   │
│  Data Layer (TanStack Query + Supabase JS)   │
└─────────────────────────────────────────────┘
                    │  HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│   Supabase: Auth · Postgres · Row-Level Sec. │
└─────────────────────────────────────────────┘
```

The **Domain Layer** holds all formulas from `SPEC.md` §4.5–§4.9 as pure TypeScript, with no React, MUI, or Supabase dependencies — fully unit-testable in isolation.

---

## 3. Data Model

Postgres (Supabase). Every table carries a `user_id` and is protected by Row-Level Security so each user accesses only her own rows.

### 3.1 `months`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid | |
| `year` | int | |
| `month` | int | 1–12 |
| `monthly_target` | numeric | SPEC §4.1 |
| unique | (`user_id`, `year`, `month`) | one plan per month |

### 3.2 `day_records`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid | |
| `date` | date | |
| `day_type` | enum | `working` \| `weekend` \| `holiday` \| `vacation_full` \| `vacation_half` |
| `entry_method` | enum | `range` \| `direct` \| `none` |
| `start_time` | time | nullable (range) |
| `end_time` | time | nullable (range) |
| `direct_hours` | numeric | nullable (direct) |
| `break_overage` | numeric | default 0 (SPEC §4.4) |
| `net_hours` | numeric | computed on save (SPEC §4.3) |
| unique | (`user_id`, `date`) | one record per day (EC-3) |

### 3.3 `settings`
| Column | Type | Default |
|---|---|---|
| `user_id` | uuid (PK) | |
| `max_daily_hours` | numeric | 12 |
| `max_consecutive_days` | int | 6 |
| `lag_factor` | numeric | 1.25 |
| `green_factor` | numeric | 1.0 |
| `yellow_factor` | numeric | 0.75 |

Month summaries and bonus (SPEC §4.10–§4.11) are computed on demand from `months` + `day_records`; no separate table in the MVP.

---

## 4. Domain Layer (Calculation Core)

A dependency-free module of pure functions, each mapped to its `SPEC` clause:

| Function | SPEC |
|---|---|
| `computeNetHours(record)` | §4.3–§4.4, EC-1, EC-2, EC-4 |
| `countWorkingDays(year, month)` | §4.5 |
| `computeSDH(monthlyTarget, workingDays)` | §4.5 |
| `computeAdjustedTarget(sdh, dayRecords)` | §4.5 |
| `computeProgress(adjustedTarget, dayRecords, today)` | §4.6, EC-7 |
| `computeForecast(...)` | §4.7, EC-12 |
| `computeRecommendedPlan(hoursRemaining, remainingDays, maxDailyHours)` | §4.7 |
| `computeDayStatus(record, sdh, settings)` | §4.9 |
| `detectAlerts(dayRecords, settings, progress, forecast)` | §4.8 |
| `computeBonus(hoursWorked, adjustedTarget)` | §4.10 |

---

## 5. Frontend Structure

**Screens (routes):**
- `/signin` — sign in (email/password or Google) (§4.12, EC-15)
- `/signup` — register (email/password) (§4.12)
- `/` — Dashboard: hours remaining, required pace, remaining days; later forecast, recommended plan, alerts
- `/calendar` — month view (react-big-calendar); per-day hours and day-type entry
- `/history` — previous months and trends (§4.11)
- `/settings` — editable thresholds (§4.13)

**Cross-cutting:** auth guard, RTL/Hebrew MUI theme wrapper, offline indicator (EC-14).

**Folder layout:**
```
src/
  domain/        # calculation core (§4) + tests
  data/          # Supabase client, TanStack Query hooks
  features/      # auth, dashboard, calendar, history, settings
  theme/         # MUI theme (RTL, palette, typography)
  App.tsx  main.tsx
```

---

## 6. Authentication, Cloud & Security

- Supabase Auth with two methods: **email + password** (register and sign in) and **"Continue with Google"** (§4.12).
- Email/password sign-up may require email verification; the session is restored on sign-in.
- Row-Level Security (`user_id = auth.uid()`) on every table (§4.12, FR-12.4).
- Data lives in Supabase and syncs across devices on sign-in (FR-12.3).
- No automatic deletion (FR-12.5).

---

## 7. Non-Functional Notes

- **Browser compatibility:** supported on all modern browsers — Chrome, Edge, Firefox, Safari. No installation required (opens via a link).
- **Offline (EC-14):** cached data is shown with an offline indicator; edits are blocked while offline. Offline editing/sync is out of MVP.
- **RTL/Hebrew (§4.14):** MUI theme `direction: 'rtl'` with `stylis-plugin-rtl`; Hebrew strings written inline in the components (no i18n library — see §10, OT-4).
- **Design:** built on MUI theming (palette, typography, spacing), finalized during implementation.

---

## 8. Testing Strategy

- Primary focus: Vitest unit tests on the Domain Layer (§4), covering every formula and edge case (EC-1…EC-13).
- Component tests (React Testing Library) for key interactions, added as features land.
- A feature is done only when its `SPEC` acceptance criteria (AC-1…AC-12) are covered by passing tests where applicable.

---

## 9. Phased Delivery

**Phase 1 — MVP:** Supabase + auth (email/password + Google) + RLS; set/edit monthly target; calendar entry (range/direct) and day types; domain core (net hours, SDH, adjusted target, progress); Dashboard; domain tests.

**Phase 2 — Guidance:** forecast + recommended plan (§4.7); daily color status (§4.9); overload & slack-pace alerts (§4.8).

**Phase 3 — Settings & History:** settings screen (§4.13); history, monthly summaries, bonus (§4.10–§4.11).

**Phase 4 — Polish:** visual refinement; optional PWA (desktop icon); optional offline editing queue.

---

## 10. Resolved Technical Decisions

- **OT-1** — Calendar UI: a ready-made calendar component (react-big-calendar), MUI-styled.
- **OT-2** — Hosting: Netlify.
- **OT-3** — Phase 1 MVP cut (§9) confirmed.
- **OT-4** (2026-06-21) — No i18n library. Hebrew UI text is written inline in the components; `react-i18next` is dropped. Rationale: Hebrew-only MVP, single developer — inline text is clearer to read and maintain. The RTL/Hebrew requirement (§4.14) is still met via the MUI RTL theme + `stylis-plugin-rtl`. Revisit only if multilingual support is requested.

---

*End of PLAN.md — version 1.0.*
