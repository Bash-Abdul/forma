# Forma implementation log

This document records what was implemented and when. Dates use Europe/London time. Add a new entry after each update, with the newest entry first. Keep earlier entries as a history of the project.

## 2026-11-17 — Beginner onboarding and lose-weight goal

### Implemented

- Added **Lose weight** to the main goals, validation, deterministic generation, saved preferences and Profile. Three-day lose-weight plans use a repeatable full-body foundation; the explanation does not promise a specific weight change.
- Made scheduling onboarding depend on experience. Beginners get definitions and examples for training days and session duration, plain-language option descriptions, and an optional **Use 3 days and 45 minutes** action. Intermediate and experienced users retain concise choices.
- Presented 45 minutes as a demo starting point, with 30- and 60-minute alternatives. Longer sessions are not described as universally optimal.
- Added beginner equipment descriptions and an explicit **I’m not sure yet** choice. Uncertainty is saved separately and uses an equipment-free starter plan; validation prevents uncertainty from implying access to gym equipment.
- Kept existing equipment preferences backwards compatible. Users can revisit Profile to choose equipment later without changing existing routines or history.
- Added beginner-only explanations of reps, sets and training splits to the plan review. Left the guidance-level step unchanged for a later review.
- Exposed checked state explicitly for browser screen readers and provided option descriptions as native accessibility hints.

### Validation

- TypeScript and ESLint passed.
- All 14 tests passed. The expanded generator matrix covers 4,464 combinations, including the new goal; focused tests cover lose-weight persistence, equipment uncertainty and legacy preferences.
- iOS, Android and web production bundles compiled successfully.
- Mobile-browser checks confirmed beginner explanations, the schedule suggestion, equipment descriptions, uncertainty, acceptance and reload of a bodyweight-only lose-weight plan, and concise intermediate choices. Preference-only updates preserved existing routines and workout history. No browser runtime errors were recorded.
- Beginner guidance on gradual starts was checked against [NHS strength and flexibility guidance](https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/); the session-length suggestion remains an explicit demo choice rather than a clinical recommendation.

### Outstanding limitations

- Physical devices and native simulators remain untested.
- Equipment uncertainty deliberately produces an equipment-free starting plan; a gym-specific plan requires the user to confirm equipment later.

## 2026-11-17 — Guided onboarding, starting plans and UI refinement

### Implemented

- Added a four-step onboarding flow for fitness goal, experience, 2–5 training days per week, 30/45/60-minute sessions, available equipment and guidance level. New and existing users can skip it without losing data.
- Added guided, flexible and independent modes. Independent mode supports saving preferences without a generated plan and opens the routine library from the dashboard.
- Added a deterministic local plan generator using full-body, upper/lower and push/pull/legs templates. Experience, goal, session duration and equipment affect movement selection, volume and rep targets; the recommendation explains those choices.
- Added a review screen with expandable session summaries. Users can rename routines, choose scheduled days, add/swap/remove/reorder exercises and edit sets and target ranges before accepting.
- Accepted plans append routines with new IDs using the existing routine and exercise models. Repeated submission of the same acceptance does not duplicate routines. Existing routines, completed workouts, weight records and active sessions are preserved.
- Added a Profile tab to view and update locally saved preferences. Preference-only updates leave the accepted plan and routine library unchanged.
- Added backwards-compatible hydration for existing `forma:v1` records. Onboarding state and preferences use the existing AsyncStorage and React Query persistence boundary.
- Connected the dashboard to the latest accepted plan and its weekly target; removed the hard-coded Upper/Lower programme label and session-time estimate.
- Added 11 equipment-free, dumbbell and barbell exercises to support equipment-aware generation, bringing the library to 29 exercises. Limited pulling options are explained explicitly in equipment-free plans.
- Reduced corner radii and outlined cards, simplified the dashboard badges and improved secondary text contrast while retaining the green palette.
- Replaced horizontal exercise-filter chip rows with labelled muscle/equipment controls and native selection sheets, explicit apply/cancel actions, selected-value summaries and a clear-filters action.
- Updated the README with onboarding behaviour, plan-generation rules and data-preservation guarantees. No application dependencies or external services were added.

### Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed: 12 tests, including seven new onboarding/plan tests. The generation matrix covers 3,348 combinations of equipment, days, experience, goal and duration.
- Tests cover deterministic results, valid equipment choices, unique scheduled days, volume/rep rules, legacy-data hydration, skip behaviour, independent session snapshots, additive acceptance, duplicate-submission protection and rejection of invalid drafts.
- `npx expo export --platform all` compiled production bundles for iOS, Android and web.
- Automated Chromium checks at a 390 × 844 mobile viewport passed against the compiled web app: skip and reload; equipment validation; plan review, rename, reschedule, set editing and exercise swapping; acceptance and reload; preference-only updates; independent-mode navigation; combined filters, search, empty results and reset; generated-routine workout start and resume after reload. Existing routines and workout history were checked in local storage. No browser runtime errors were recorded.
- Reviewed browser screenshots of onboarding and exercise filtering. Browser tooling and missing test libraries were installed temporarily under `/tmp`; project dependencies and host system packages were unchanged.

### Outstanding limitations

- Physical iOS/Android devices and simulators have not been tested. Native compilation here verifies JavaScript bundling, not installed native builds or device interactions.
- Plans use fixed local rules rather than adaptive coaching. Session durations are estimates; equipment-free upper-back movements are not equivalent to loaded pulling.
- Unaccepted drafts are kept in memory only; leaving onboarding discards them.
- Dependency-audit findings recorded in the initial implementation entry remain outside this update.

## 2026-11-17 — Implementation documentation

### Implemented

- Added this dated log of completed work, validation and outstanding limitations.
- Linked the log from the README.
- Added project instructions to maintain the log after future updates.

### Validation

- Reviewed the existing source files, package configuration and previous verification results to document the initial implementation below.
- Documentation changes only; application tests were not rerun for this entry.

## 2026-11-17 — Initial Forma application

### Implemented

| Area                | What was built                                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App foundation      | Expo and React Native application with strict TypeScript, Expo Router navigation, feature-based modules, shared UI components, and a green and neutral visual theme.                                        |
| Dashboard           | Welcome screen, next scheduled routine, weekly completion, recent workout activity, latest body weight, and shortcuts to training and weight logging.                                                       |
| Routines            | Four-day Upper/Lower sample programme; create, edit and delete routines with confirmation; add, remove and reorder exercises; configure sets and target rep ranges; choose a scheduled day; start workouts. |
| Exercise library    | 18 exercises covering major muscle groups, with search, muscle and equipment filters, categories, secondary muscles and basic execution instructions.                                                       |
| Workout logging     | Start a session from a routine, enter weight and repetitions, mark sets complete, add or remove sets, and view previous exercise performance. Active sessions persist locally and can be resumed.           |
| Workout history     | Finish and save completed sets, browse completed sessions, and review session details, duration and training volume. Empty sessions are rejected.                                                           |
| Template separation | Sessions copy the planned routine into an independent performance record. Workout changes do not overwrite the routine template.                                                                            |
| Progress            | Validated body-weight logging, weight history, a weight trend chart, total sessions, weekly sessions and total training volume.                                                                             |
| Local data          | AsyncStorage persistence behind TanStack Query, a versioned storage key, serialized writes, and realistic initial sample records.                                                                           |
| Tooling             | ESLint, Prettier, dependency lockfile, setup documentation and five training-logic tests.                                                                                                                   |

### Validation completed

- TypeScript check passed: `npm run typecheck`.
- ESLint passed: `npm run lint`.
- All five training-logic tests passed: `npm test`.
- Prettier formatting check passed.
- Expo dependency compatibility check passed: `npx expo install --check`.
- Production JavaScript bundles compiled for iOS, Android and web: `npx expo export --platform all`.

The tests cover independent session snapshots, valid set input, Monday-based weekly boundaries, completed-set saving, preservation of routine templates, and rejection of empty sessions or invalid planned rep ranges.

### Outstanding limitations

- Physical-device, simulator and interactive browser testing have not been performed. Bundle compilation does not establish that every interaction works on a device.
- The dependency installation reported 14 vulnerabilities (9 moderate and 5 high). These remain to be reviewed before release; this is the result recorded at implementation time.
- Data stays on the device. Clearing app storage removes records. Accounts, cloud sync, export, nutrition, social features and personalised AI guidance are outside this version.

## Format for future entries

Use this structure above the existing dated entries. Record actual completion dates and actual checks; distinguish work implemented from behaviour verified.

```md
## YYYY-MM-DD — Short update title

### Implemented

- Describe the features, fixes or other changes delivered.

### Validation

- Record checks performed and their results, or state that checks were not run.

### Outstanding limitations

- Record unresolved issues or unverified behaviour, if any.
```
