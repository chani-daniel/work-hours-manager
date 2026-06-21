# TASKS.md — Work Hours Manager (Phase 1 / MVP)

| | |
|---|---|
| **Status** | Active |
| **Version** | 1.0 |
| **Date** | 2026-06-18 |
| **Stage** | 3 of 5 (Task Breakdown) — derived from `PLAN.md` v1.0, Phase 1 (§9) |

Each task is small and independently verifiable, with the seven required sections: **Goal · Context · In · Out · Edge · DoD · Deps · Out of scope**. Scope is the MVP only; Phases 2–4 are not broken down here.

**Status legend:** `Not started` · `In progress` · `Blocked` · `Done` · `Deferred` (intentionally postponed — revisit later). Keep the summary table updated each working day.

---

## Summary

| # | Task | Deps | Status |
|---|---|---|---|
| TASK-001 | Project scaffold (Vite + React + TS + Vitest) | — | Done |
| TASK-002 | MUI RTL theme (Hebrew text inline) | 001 | Done |
| TASK-003 | Supabase project: schema + RLS | — | Done |
| TASK-004 | Supabase client + auth (email/password) | 001, 003 | Done |
| TASK-005 | Auth guard + app routing/layout | 002, 004 | Done |
| TASK-006a | Data hooks: months + settings | 003, 004 | Not started |
| TASK-006b | Data hooks: day_records | 003, 004 | Not started |
| TASK-007 | Domain: `computeNetHours` | 001 | Not started |
| TASK-008 | Domain: `countWorkingDays` + `computeSDH` | 001 | Not started |
| TASK-009 | Domain: `computeAdjustedTarget` | 008 | Not started |
| TASK-010 | Domain: `computeProgress` | 007, 009 | Not started |
| TASK-011 | Monthly target screen | 005, 006a | Not started |
| TASK-012a | Calendar month view | 005, 006b | Not started |
| TASK-012b | Day entry editor | 012a, 006b, 007 | Not started |
| TASK-013 | Dashboard screen | 010, 011, 012b | Not started |
| TASK-014 | Deploy to Netlify | 005 | Not started |
| TASK-015 | Google sign-in (deferred enhancement) | 004 | Deferred |

---

## TASK-001 — Project scaffold (Vite + React + TS + Vitest)
- **Goal:** Create the base React + TypeScript app with Vitest configured.
- **Context:** PLAN §1, §5 (folder layout).
- **In:** —
- **Out:** Running dev server; passing sample test; folder structure (`domain/`, `data/`, `features/`, `theme/`, `i18n/`).
- **Edge:** Node version mismatch; failing initial build.
- **DoD:** `npm run dev` serves the app; `npm test` runs and passes one trivial test.
- **Deps:** —
- **Out of scope:** Any feature code, styling, backend.

## TASK-002 — MUI RTL theme (Hebrew text inline)
- **Goal:** Configure MUI with an RTL theme. Hebrew UI text is written directly in components — no i18n library.
- **Context:** SPEC §4.14; PLAN §1, §7. **Decision (2026-06-21):** dropped `react-i18next` (planned in PLAN/SPEC) for the MVP — Hebrew-only, single developer; inline text is clearer. Revisit only if multilingual support is needed.
- **In:** App root from TASK-001.
- **Out:** App renders right-to-left in Hebrew; MUI theme (palette, typography) with `stylis-plugin-rtl` for mirrored styles; Hebrew strings written inline in JSX.
- **Edge:** Styles not mirrored (missing `stylis-plugin-rtl`).
- **DoD:** A sample MUI screen renders RTL with Hebrew text.
- **Deps:** TASK-001.
- **Out of scope:** i18n / multilingual support (Hebrew only, inline); actual app screens.

## TASK-003 — Supabase project: schema + RLS
- **Goal:** Create the Supabase project and the three tables with Row-Level Security.
- **Context:** SPEC §4.12; PLAN §3, §6.
- **In:** Table definitions from PLAN §3.
- **Out:** `months`, `day_records`, `settings` tables with constraints + RLS policies (`user_id = auth.uid()`).
- **Edge:** Unique constraints (one month per user; one record per day); RLS blocking legitimate access if misconfigured.
- **DoD:** Tables exist; RLS verified — a user can read/write only her own rows; uniqueness enforced.
- **Deps:** —
- **Out of scope:** App-side data access (TASK-006).

## TASK-004 — Supabase client + authentication (email/password)
- **Goal:** Integrate the Supabase client and enable email/password authentication.
- **Context:** SPEC §4.12, EC-15; PLAN §6. **Decision (2026-06-21):** Google sign-in deferred to a later enhancement (see "Deferred enhancements"); MVP ships with email/password only.
- **In:** Supabase project from TASK-003.
- **Out:** Sign-up (email/password), sign-in (email/password), sign-out; current-session access that survives a page refresh.
- **Edge:** Wrong credentials; unverified email; expired session.
- **DoD:** A user can register, sign in with email/password, and sign out; session persists across reloads. (Verified live 2026-06-21.)
- **Deps:** TASK-001, TASK-003.
- **Out of scope:** Google sign-in (deferred); route protection (TASK-005); password reset.

## TASK-005 — Auth guard + app routing/layout
- **Goal:** Add routing, an app layout, and protect authenticated routes.
- **Context:** SPEC §4.12, EC-15; PLAN §5.
- **In:** Auth from TASK-004; theme from TASK-002.
- **Out:** Routes `/signin`, `/signup`, `/`, `/calendar`; unauthenticated users are redirected to `/signin`; shared RTL layout (nav + offline indicator placeholder).
- **Edge:** Direct navigation to a protected route while signed out; redirect loop.
- **DoD:** Protected routes require sign-in; signed-in users reach the app shell.
- **Deps:** TASK-002, TASK-004.
- **Out of scope:** Screen contents (TASK-011…013); history/settings routes (Phase 3).

## TASK-006a — Data hooks: months + settings
- **Goal:** Build TanStack Query hooks for reading/writing the month target and the user settings.
- **Context:** SPEC §4.1, §4.13; PLAN §3.
- **In:** Supabase client (TASK-004); schema (TASK-003).
- **Out:** Hooks to get/set the current month's target (one row per user per month) and to read/update settings; cache invalidation on write.
- **Edge:** No month row yet (first use); empty settings → defaults; offline read from cache (EC-14).
- **DoD:** Hooks perform CRUD against Supabase for `months` and `settings` with correct cache updates; verified manually and/or with tests.
- **Deps:** TASK-003, TASK-004.
- **Out of scope:** Day records (TASK-006b); UI; computed summaries.

## TASK-006b — Data hooks: day_records
- **Goal:** Build TanStack Query hooks for listing and upserting day records (one per day).
- **Context:** SPEC §4.3, §4.13; PLAN §3.
- **In:** Supabase client (TASK-004); schema (TASK-003).
- **Out:** Hooks to list a month's day records and to upsert a single day (insert-or-update on the unique day key); cache invalidation on write.
- **Edge:** Duplicate day upsert maps to edit (EC-3); offline read from cache (EC-14); empty result sets.
- **DoD:** Hooks perform CRUD against Supabase for `day_records` with correct cache updates; uniqueness (one record per day) respected; verified manually and/or with tests.
- **Deps:** TASK-003, TASK-004.
- **Out of scope:** Month/settings hooks (TASK-006a); UI; computed summaries.

## TASK-007 — Domain: `computeNetHours`
- **Goal:** Compute a day's net hours from its entry.
- **Context:** SPEC §4.3–§4.4, EC-1, EC-2, EC-4.
- **In:** A day record (range with break overage, or direct hours).
- **Out:** Net hours (≥ 0).
- **Edge:** End ≤ start (EC-1); overage ≥ duration (EC-2); invalid direct hours <0 / >24 (EC-4).
- **DoD:** Pure function with Vitest tests covering EC-1, EC-2, EC-4 and normal cases — all pass.
- **Deps:** TASK-001.
- **Out of scope:** Persistence; UI validation messages.

## TASK-008 — Domain: `countWorkingDays` + `computeSDH`
- **Goal:** Count Sun–Thu working days in a month and derive Standard Daily Hours.
- **Context:** SPEC §4.5.
- **In:** Year, month, monthly target.
- **Out:** Working-day count; `SDH = target ÷ workingDays`.
- **Edge:** Months of differing length / leap February; target = 0 (EC-13).
- **DoD:** Pure functions with Vitest tests across several months and a leap year — all pass.
- **Deps:** TASK-001.
- **Out of scope:** Holiday/vacation reduction (TASK-009).

## TASK-009 — Domain: `computeAdjustedTarget`
- **Goal:** Reduce the monthly target for holidays and vacations.
- **Context:** SPEC §4.5 (factors), §4.2, FR-2.5, EC-11.
- **In:** SDH; the month's day records (with day types).
- **Out:** Adjusted target.
- **Edge:** Half vacation = 0.5 (EC-11); holiday/vacation on weekend = factor 0 (FR-2.5).
- **DoD:** Pure function with Vitest tests covering full/half time off and weekend cases — all pass.
- **Deps:** TASK-008.
- **Out of scope:** Progress/pace (TASK-010).

## TASK-010 — Domain: `computeProgress`
- **Goal:** Compute hours worked, hours remaining, remaining available days, and required pace.
- **Context:** SPEC §4.6, EC-7, EC-9.
- **In:** Adjusted target; day records; today's date.
- **Out:** `{ hoursWorked, hoursRemaining, remainingAvailableDays, requiredPace }`.
- **Edge:** No remaining available days but hours remain (EC-7); weekend work counts toward hours but not pace days (EC-9); negative remaining (above target).
- **DoD:** Pure function with Vitest tests covering EC-7, EC-9 and normal cases — all pass.
- **Deps:** TASK-007, TASK-009.
- **Out of scope:** Forecast, recommended plan, alerts, color status (Phase 2).

## TASK-011 — Monthly target screen
- **Goal:** Let the user set and edit the monthly hours target.
- **Context:** SPEC §4.1, FR-1.2, EC-13; PLAN §5.
- **In:** Target value (decimal > 0); month/settings hooks (TASK-006a).
- **Out:** A screen to enter/update the current month's target, persisted to Supabase.
- **Edge:** Empty/zero target (EC-13); mid-month change recalculates derived values (EC-5).
- **DoD:** Target saves and reloads; invalid values are blocked with a Hebrew message.
- **Deps:** TASK-005, TASK-006a.
- **Out of scope:** Pace/forecast display (TASK-013).

## TASK-012a — Calendar month view
- **Goal:** Show a month calendar that displays existing day records and lets the user pick a day to edit.
- **Context:** SPEC §4.2; PLAN §5.
- **In:** Day records via data hooks (TASK-006b).
- **Out:** react-big-calendar month view (RTL, Hebrew), rendering each day's net hours / day type; month navigation; selecting a day opens the editor (TASK-012b).
- **Edge:** Empty month (no records); month with mixed day types; locale/RTL rendering of the grid.
- **DoD:** The calendar renders the current month with existing records shown; navigating months loads the right data; selecting a day signals which date to edit.
- **Deps:** TASK-005, TASK-006b.
- **Out of scope:** The day editor itself (TASK-012b); color status (Phase 2); history (Phase 3).

## TASK-012b — Day entry editor
- **Goal:** Let the user enter a day's hours and set its day type, persisted as one record per day.
- **Context:** SPEC §4.2, §4.3, EC-3, EC-6, EC-10; PLAN §5.
- **In:** Selected date from the calendar (TASK-012a); day-record hooks (TASK-006b); `computeNetHours` (TASK-007).
- **Out:** A day editor for range/direct hours, break overage, and day type (working/weekend/holiday/vacation full/half); upserts one record per day.
- **Edge:** Duplicate day = edit existing (EC-3); marking time off on a worked day (EC-6); future work date blocked, future holiday/vacation allowed (EC-10).
- **DoD:** Entering/editing a day persists correct net hours; day-type marking saved; edge cases handled with Hebrew messages.
- **Deps:** TASK-012a, TASK-006b, TASK-007.
- **Out of scope:** Color status (Phase 2); history (Phase 3).

## TASK-013 — Dashboard screen
- **Goal:** Display the core guidance: hours worked, hours remaining, remaining available days, required pace.
- **Context:** SPEC §4.6, FR-6.5; PLAN §5.
- **In:** `computeProgress` (TASK-010); month + day data (TASK-006a, TASK-006b, TASK-011, TASK-012b).
- **Out:** A Dashboard showing the four values for the current month, updating as data changes.
- **Edge:** No target set (EC-13); no records yet (EC-12); cannot complete in remaining days (EC-7).
- **DoD:** Values match the domain calculations for sample data; updates live after edits.
- **Deps:** TASK-010, TASK-011, TASK-012b.
- **Out of scope:** Forecast, recommended plan, alerts, bonus (Phase 2–3).

## TASK-014 — Deploy to Netlify
- **Goal:** Deploy the MVP to Netlify with a shareable link.
- **Context:** PLAN §1, §7.
- **In:** Built app; Supabase keys as environment variables.
- **Out:** Public URL; build runs on push; environment configured.
- **Edge:** Missing env vars; SPA route refresh returning 404 (needs redirect rule).
- **DoD:** The app loads from the Netlify URL, sign-in works, and data persists.
- **Deps:** TASK-005.
- **Out of scope:** Custom domain; PWA/desktop icon (Phase 4).

## TASK-015 — Google sign-in (deferred enhancement)
- **Goal:** Add "Continue with Google" alongside the existing email/password auth.
- **Context:** SPEC §4.12, EC-15; PLAN §6. **Status:** Deferred (decided 2026-06-21) — revisit near the end of the project. The `signInWithGoogle` method already exists in `AuthProvider`; what remains is external OAuth setup + a UI button.
- **In:** Existing auth (TASK-004); a Google Cloud OAuth client; Supabase Google provider enabled.
- **Out:** A "Continue with Google" button on the auth screen that signs a user in via Google.
- **Edge:** Google popup/redirect blocked; account already exists with the same email.
- **DoD:** A user can sign in with Google and reach the signed-in app; session persists across reloads.
- **Deps:** TASK-004.
- **Out of scope:** Other social providers.

---

*End of TASKS.md — version 1.0. Update task statuses each working day. Phases 2–4 will be broken down when their turn comes.*
