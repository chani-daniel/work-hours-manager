# SPEC.md — Work Hours Manager

| | |
|---|---|
| **Status** | Approved |
| **Version** | 0.2 |
| **Date** | 2026-06-18 |
| **Stage** | 1 of 5 (Understanding & Spec) — approved; proceeding to `PLAN.md` |

> This document describes **what** the system does, not **how** it is implemented. Every technology decision (platform, database, language, libraries) belongs to Stage 2 and `PLAN.md`. Any change to the requirements starts with updating this document.

---

## 1. Overview & Purpose

A personal tool for a single user to manage her work hours against a **monthly hours target**. The tool is not merely an hours logger — it is a **guide and balancer**: it shows how much is left, at what pace she needs to work, alerts on overload or on falling behind, and offers a **recommended plan** to close gaps.

**Guiding principle:** the user always knows, at a glance, whether she is "on track" toward the monthly target, and what the recommended next step is.

---

## 2. Definitions & Glossary

| Term | Definition |
|---|---|
| **Calendar month** | The planning unit. All calculations are performed within the bounds of a single calendar month (the 1st through month-end). |
| **Monthly target** (`monthlyTarget`) | The number of hours the user must work in the month, as entered at its start. |
| **Working days (default)** | Sunday–Thursday. Friday and Saturday are not working days by default. |
| **Available day** | A working day that is neither a holiday nor a vacation day. Only available days count in the pace calculation. |
| **Standard Daily Hours** (`SDH`) | `monthlyTarget ÷ number of working days (Sun–Thu) in the calendar month`. A fixed value for the month, derived from the original target and the calendar. |
| **Adjusted target** (`adjustedTarget`) | The monthly target after reduction for holidays and vacation days (see §4.5). This is the target the user must actually meet. |
| **Net hours** | The actual work hours for a day, after deducting break overage (if any). |
| **Required pace** (`requiredPace`) | How many hours, on average, must be worked on each remaining available day to meet the adjusted target. |
| **Bonus** | Hours worked beyond the adjusted target at month-end. Saved as a message; does not roll over. |

---

## 3. Users & User Stories

**User:** a single user who registers and signs in with an email and password, or with "Continue with Google", so her data syncs across her devices via the cloud. No multiple users, roles, or shared accounts (see §8). The interface is in Hebrew only (RTL).

- **US-1** — As a user, I want to set my hours target at the start of the month, so the system can guide me against it.
- **US-2** — As a user, I want to log each day either a start–end time **or** a number of hours, to record my work in whichever way is convenient.
- **US-3** — As a user, I want to correct or enter days retroactively, since I don't always log in real time.
- **US-4** — As a user, I want to mark holidays and vacation days, so my target decreases and I don't have to make them up.
- **US-5** — As a user, I want to see on the Dashboard how many hours are left and at what daily pace I must work, to plan myself.
- **US-6** — As a user, I want an end-of-month forecast and a suggested plan to close a gap, to know in advance whether I'm on the right path.
- **US-7** — As a user, I want an alert when I'm working too hard (overload), to take care of myself.
- **US-8** — As a user, I want an alert when my pace is too slack, so I don't discover at month-end that I fell short.
- **US-9** — As a user, I want to see a daily visual status in the calendar (green/yellow/red), to understand my state at a glance.
- **US-10** — As a user, I want a bonus message saved for the month if I exceed the target, so the extra effort is recorded.
- **US-11** — As a user, I want to view history and a summary of previous months, to track trends.
- **US-12** — As a user, I want to sign in simply and access my data from any of my devices, so my hours are always with me.
- **US-13** — As a user, I want to adjust the thresholds (daily max, consecutive days, pace/color thresholds) from a settings screen, so the guidance fits me.

---

## 4. Functional Requirements

### 4.1 Setting the Monthly Target
- **FR-1.1** — The user enters an hours target for each calendar month (a positive number, including fractions, e.g., 182.5).
- **FR-1.2** — The target may be updated mid-month; all derived calculations (`SDH`, `adjustedTarget`, pace, forecast) update immediately (§4.5, §4.6).
- **FR-1.3** — Each month stands on its own; there is no rollover of target or hours between months.

### 4.2 Day Types
Each day in the calendar has exactly **one type**:
- **FR-2.1** — *Working day* (default Sun–Thu) — hours may be logged on it.
- **FR-2.2** — *Weekend* (default Fri–Sat) — not counted, but the user **may** log hours on it that will count toward the target (see edge case §6, EC-9).
- **FR-2.3** — *Holiday* — a working day marked as a holiday. Not available; reduces the target (§4.5).
- **FR-2.4** — *Vacation* (personal or general) — a working day marked as time off, full or half. Not available (half = half available); reduces the target (§4.5).
- **FR-2.5** — A holiday or vacation falling on a weekend has **no effect** on the target (the day is not a working day anyway).

### 4.3 Daily Hours Entry
- **FR-3.1** — For each day, two alternative entry methods:
  - **(a) Time range**: a start time and an end time. Net hours = `(end − start) − break overage`.
  - **(b) Direct hours**: a number of net hours directly (e.g., 7.5).
- **FR-3.2** — There is no automatic break deduction. Entering 09:00–17:00 = a full 8 hours, unless a break overage was recorded (§4.4).
- **FR-3.3** — A day has exactly **one record**. Re-entering an existing day = editing the existing record, not creating a duplicate (§6, EC-3).
- **FR-3.4** — Any past day in the current month may be entered and corrected retroactively.

### 4.4 Breaks & Overages
- **FR-4.1** — A permitted break that does not require reporting has no effect on the hours.
- **FR-4.2** — If the user exceeded the permitted break, she records the **overage duration** (in minutes/hours), and it is deducted from that day's net hours only.
- **FR-4.3** — Break overage is relevant mainly to the "time range" method; in the "direct hours" method the user enters net hours anyway (overage optional).

### 4.5 Computing the Adjusted Target
- **FR-5.1** — `SDH = monthlyTarget ÷ (number of Sun–Thu days in the calendar month)`.
- **FR-5.2** — `adjustedTarget = monthlyTarget − (SDH × sum of non-available day factors)`, where:
  - Holiday on a working day = factor 1
  - Full vacation on a working day = factor 1
  - Half vacation on a working day = factor 0.5
  - Holiday/vacation on a weekend = factor 0
- **FR-5.3** — Example: target 180, 22 working days ⇒ `SDH = 8.18`. 2 full vacation days ⇒ `adjustedTarget = 180 − 16.36 = 163.64`. The user does not make up the 16.36 hours.
- **FR-5.4** — `SDH` is always derived from the original target and the month's calendar, and does not change when vacation days are added (only `adjustedTarget` decreases).

### 4.6 Progress & Pace Calculations
- **FR-6.1** — `hours worked = Σ net hours of all days that have a record`.
- **FR-6.2** — `hours remaining = adjustedTarget − hours worked` (may be negative = above target).
- **FR-6.3** — `remaining available days = available days (not weekend/holiday/vacation) whose date ≥ today and that have no record`. (A half-vacation day counts as 0.5.)
- **FR-6.4** — `requiredPace = hours remaining ÷ remaining available days` (when remaining days > 0).
- **FR-6.5** — Shown on the Dashboard: hours remaining, required pace, number of remaining available days.

### 4.7 End-of-Month Forecast & Recommended Plan
- **FR-7.1** — `current pace = hours worked ÷ number of available days that have already passed and have a record`.
- **FR-7.2** — `end-of-month forecast = hours worked + (current pace × remaining available days)`.
- **FR-7.3** — If `forecast < adjustedTarget` there is a **gap**; the system displays it and offers a **recommended plan**:
  - Basic plan: an even distribution of "hours remaining" across "remaining available days" (= the required pace per day).
  - The plan will **not exceed** the configured daily maximum (§4.8). If an even distribution exceeds the maximum, the system spreads up to the maximum and flags that the target is not reachable within healthy limits.
  - The plan is presented as a recommendation for each remaining available day (e.g., "Sun 8.5h, Mon 8.5h, Wed 9h").
- **FR-7.4** — If `forecast ≥ adjustedTarget` — a positive message is shown ("at this pace you'll meet the target").

### 4.8 Alerts (Dashboard only)
All alerts are shown within the app on the Dashboard. No push/email (§8).

**Overload ("working too hard") — triggered if any of the following holds:**
- **FR-8.1** — A single day's net hours exceed the daily maximum (`maxDailyHours`, default **12**, configurable).
- **FR-8.2** — A run of working days without a rest day exceeds the threshold (`maxConsecutiveDays`, default **6**, configurable).

**Slack pace ("may fall short") — triggered if any of the following holds:**
- **FR-8.3** — `end-of-month forecast < adjustedTarget`.
- **FR-8.4** — `requiredPace > SDH × lag threshold` (`lagFactor`, default **1.25**, configurable) — i.e., she is now required to do more than 25% above the standard day to complete.

### 4.9 Daily Visual Status in the Calendar
- **FR-9.1** — Each day in the calendar gets a color:
  - **Green** — the day's net hours ≥ `SDH` (met the standard day).
  - **Yellow** — net hours between `SDH × 0.75` and `SDH` (slightly below).
  - **Red** — net hours < `SDH × 0.75`, or exceeding the daily maximum (overload).
  - **Gray/neutral** — weekend, holiday, vacation (not counted toward the target).
- **FR-9.2** — Future days with no record are shown empty (no status color).

### 4.10 Bonus (Exceeding the Target)
- **FR-10.1** — At month-end, if `hours worked > adjustedTarget`, a **bonus message** is saved for the month: `bonus = hours worked − adjustedTarget`.
- **FR-10.2** — The bonus is saved in history as a message ("in month X you worked Y extra hours") and **does not roll over** and does not offset subsequent months.

### 4.11 History & Monthly Summary
- **FR-11.1** — For each completed month, a summary is saved: adjusted target, total hours worked, whether the target was met, and the bonus message (if any).
- **FR-11.2** — The user can browse previous months and trends (e.g., meeting the target over time).

### 4.12 Authentication & Cloud Sync
- **FR-12.1** — The user can **register** and **sign in** with an email and password, or use **"Continue with Google"**.
- **FR-12.2** — Sign-up with email/password may require email verification; sign-in restores the user's session.
- **FR-12.3** — All data is stored in the cloud and tied to the signed-in user, so it is accessible and synced across her devices.
- **FR-12.4** — Data is private to the signed-in user; without signing in, no data is shown.
- **FR-12.5** — Data is retained indefinitely (no automatic deletion).

### 4.13 Settings
- **FR-13.1** — A settings screen lets the user view and change: `maxDailyHours`, `maxConsecutiveDays`, `lagFactor`, and the color thresholds (§4.9).
- **FR-13.2** — Changing a setting immediately recalculates the affected alerts, statuses, and recommendations.
- **FR-13.3** — Each setting has a sensible default (§9), used until the user changes it.

### 4.14 Language & Localization
- **FR-14.1** — The user interface is in Hebrew only, with a right-to-left (RTL) layout.
- **FR-14.2** — Dates, times, and numbers are displayed in formats appropriate for a Hebrew-speaking user.

---

## 5. Inputs & Outputs

| Field | Type | Format / valid range |
|---|---|---|
| Monthly target | Decimal | > 0 |
| Start / end time | Time | HH:MM, 00:00–23:59 |
| Direct hours | Decimal | 0 ≤ x ≤ 24 |
| Break overage | Decimal | 0 ≤ x, and not more than the day's duration |
| Day type | Category | {working, weekend, holiday, full vacation, half vacation} |
| Date | Date | Within the managed calendar month |
| **Computed outputs** | | |
| Net hours per day | Decimal | ≥ 0 |
| Hours remaining | Decimal | May be negative (= bonus) |
| Required pace | Decimal | ≥ 0 |
| End-of-month forecast | Decimal | ≥ 0 |
| Daily status | Category | {green, yellow, red, neutral, empty} |

---

## 6. Edge Cases

- **EC-1 — End before start:** in the time-range method, if the end time ≤ the start time — an error and a prompt to correct or use direct-hours entry. Shifts crossing midnight are not supported at this stage (§8).
- **EC-2 — Break overage ≥ day duration:** net hours never drop below 0; if the deduction yields a negative value — an error and a request to check the data.
- **EC-3 — Duplicate entry for the same day:** the system edits the existing record and asks for replacement confirmation; it does not create a second record.
- **EC-4 — Invalid direct hours:** negative, 0 without justification, or > 24 — blocked with an error message.
- **EC-5 — Changing the target mid-month:** allowed; `SDH` and `adjustedTarget` are recomputed, and the entire Dashboard updates. Past records are preserved.
- **EC-6 — Marking vacation/holiday on a day that already has logged hours:** a conflict. The system warns; the user chooses to cancel the record (then the day is considered non-available) or cancel the marking.
- **EC-7 — No remaining available days but hours remain:** the required pace is undefined (division by 0); an alert is shown: "the target cannot be completed in the remaining days."
- **EC-8 — Today is the last day / the month has ended:** the forecast = actual hours worked; a summary and bonus are computed.
- **EC-9 — Working on a weekend:** the hours count toward the target (reducing "hours remaining") but the day is not an "available day" for the projected-pace calculation.
- **EC-10 — Entering hours for a future date:** logging *work* hours for a future date is blocked (one cannot work in the future); marking a future *holiday/vacation* is allowed.
- **EC-11 — Half vacation:** reduces the target by 0.5×SDH, and the day remains available for logging half a workday (counts as 0.5 of an available day).
- **EC-12 — A month with no work records at all:** the current pace is undefined; the forecast is based on the required pace only, with an appropriate message.
- **EC-13 — Target = 0 or empty:** the system does not show pace/forecast calculations and asks to enter a target first.
- **EC-14 — Offline / no network:** since data is cloud-based, when offline the app shows the last loaded data with a clear "offline" indicator and prevents data loss (edits are blocked or queued until the connection returns).
- **EC-15 — Not signed in / session expired:** the app shows the sign-in screen and no data until the user authenticates.

---

## 7. Acceptance Criteria (Definition of Done)

The spec is considered correctly implemented when, for each feature:
- **AC-1** — A monthly target can be set and seen factored into all calculations (§4.1, §4.5).
- **AC-2** — A day can be entered in both methods (range / direct hours) and yields correct net hours, including break-overage deduction (§4.3–§4.4).
- **AC-3** — Marking a holiday/vacation (full/half) reduces the adjusted target exactly per the formula in §4.5, and ignores weekends.
- **AC-4** — The Dashboard correctly displays hours remaining, required pace, and remaining available days (§4.6).
- **AC-5** — The end-of-month forecast is computed, and in case of a gap a recommended plan is shown that does not exceed the daily maximum (§4.7).
- **AC-6** — Overload and slack-pace alerts trigger exactly per the thresholds in §4.8.
- **AC-7** — The daily color status matches the rules of §4.9.
- **AC-8** — At the end of a month in which hours beyond the target were worked, a non-rolling bonus message is saved (§4.10).
- **AC-9** — History of previous months is saved and can be browsed (§4.11).
- **AC-10** — All edge cases in §6 are handled with defined behavior (no crash, a clear message).
- **AC-11** — The user can sign in with the simple method and see her data synced across devices; data is private per user (§4.12).
- **AC-12** — Settings can be changed and immediately affect alerts/statuses/recommendations (§4.13); the UI is Hebrew RTL (§4.14).

---

## 8. Out of Scope

- Computing salary, rates, or payment.
- Multiple users, roles, or shared accounts (single-user sign-in only — see §4.12).
- Alerts outside the app (push, email, SMS).
- Planning periods other than a calendar month (weekly, quarterly, cross-month).
- Rolling over bonus/deficit between months.
- Shifts crossing midnight (night hours continuing into the next day).
- Exporting data (e.g., to Excel) — dropped from scope.
- External integrations (Google Calendar, attendance systems, payroll export).
- A multilingual UI (Hebrew only — see §4.14).
- Any technology decisions (determined in `PLAN.md`).

---

## 9. Assumptions & Open Questions

Defaults and decisions (confirmed in review unless noted):
- **A-1** — Half vacation days are supported (factor 0.5). *(Approved)*
- **A-2** — A holiday/vacation on a weekend has no effect on the target. *(Approved)*
- **A-3** — Daily maximum hours for overload = 12 hours. *(Default; editable in Settings §4.13)*
- **A-4** — Maximum consecutive working days without rest = 6. *(Default; editable in Settings §4.13)*
- **A-5** — "Slack pace" threshold = required pace above 1.25×SDH. *(Default; editable in Settings §4.13)*
- **A-6** — Color thresholds: green ≥ SDH, yellow ≥ 0.75×SDH, red below. *(Default; editable in Settings §4.13)*
- **A-7** — Gregorian calendar; holidays are marked manually by the user (no automatic holiday source at this stage). *(Approved)*

---

*End of SPEC.md — version 0.2 (approved). Proceeding to Stage 2: `PLAN.md` (technical planning).*
