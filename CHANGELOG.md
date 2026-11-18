# Forma implementation log

This document records what was implemented and when. Dates use Europe/London time. Add a new entry after each update, with the newest entry first. Keep earlier entries as a history of the project.

## 2026-11-18 — Distinct typography and simpler UI details

### Implemented

- Introduced a deliberate font pairing: **Barlow Condensed SemiBold** for page/section headings, calendar dates and headline numbers; **DM Sans Regular, Medium and SemiBold** for body text, controls and navigation. Explicit font faces avoid synthetic bold weights.
- Bundled four local font assets through Expo Font and the Google Fonts packages. Fonts do not require a runtime internet connection. Initial rendering waits for font readiness; failed loads retain usable system-font fallbacks rather than blocking the app.
- Reworked the weekly calendar into simple ruled columns instead of separate floating tiles, retaining today's highlight, scheduled-day dots and completion marks. Kept the green workout panel and lime action with stronger typography and quieter corners.
- Removed shared boxed icon badges and repeated diagonal arrows, using understated chevrons only for actionable rows. Made secondary buttons outlined, reduced surface rounding and replaced remaining promotional headings with direct labels.
- Applied the font pairing to forms, charts, onboarding, welcome/launch, profile, workouts and tab labels. Added explicit tab-label line height for the new font. Light / Dark / System settings and all saved records remain intact.

### Validation

- TypeScript, ESLint and all **27 tests passed**.
- iOS, Android and web exports succeeded with bundled font assets. A final web export passed after fallback-stack and tab-label adjustments.
- Mobile-browser checks passed for real font loading, a simulated font-request failure with usable fallback text, light/dark screenshots, saved appearance across reloads, live System changes, filter sheets, weight fields, 320px layout without horizontal overflow and unchanged saved records. No runtime errors occurred in the normal flow.
- Reviewed the updated Home typography in light and dark mode.

### Outstanding limitations

- Physical iOS/Android checks of font scaling, native tab labels and cold-launch timing remain to be performed in Expo Go. Restart the existing tunnel with a cleared Metro cache to load the new font dependencies.
- The pre-existing dependency audit remains at 43 findings (41 high, 2 moderate); no forced breaking dependency changes were applied.

## 2026-11-17 — Dashboard refresh and Light / Dark / System appearance

### Implemented

- Restored the seven-day Home calendar and prominent green feature panel with a lime action. Today, planned training days and actual completed workout days are distinguished; starter templates and example sessions do not invent a personal schedule or progress.
- Kept Home personalised: the green panel resumes an active workout, starts a planned session, opens a relevant guide, or offers a check-in according to the user's interests. Existing routines, sessions and body-weight records are preserved.
- Simplified Home into short lists and training totals, removed repeated action cards and generic promotional copy, reduced shared corner radii and tightened headings across routines, exercises, progress and learning.
- Added accessible **Profile → Appearance** controls for **Light / Dark / System**. Preferences save through the existing React Query/AsyncStorage persistence layer. Existing and new installs default to System; invalid appearance values safely fall back to System without changing records.
- Added semantic palettes and context-driven StyleSheet factories throughout screens, charts, forms, selection sheets, navigation and shared components. Theme changes update in place without restarting onboarding or the launch animation.
- Enabled automatic native appearance and installed the SDK-compatible `expo-system-ui` module. Native appearance overrides, status text and root backgrounds follow the chosen preference.

### Validation

- TypeScript and ESLint passed; Prettier checks passed.
- All **27 tests passed**, including three new tests for theme resolution, persistence/defaults without record changes, and local calendar completion/schedule rules.
- iOS, Android and web export succeeded. A final web export also passed after the appearance selector's accessibility marker was added.
- Mobile-browser checks passed for the calendar and green panel, saved dark appearance across reloads, live System changes, explicit Light overriding a dark system, dark filter sheets and weight inputs, 320px layout without horizontal overflow, unchanged saved training/weight records and no runtime errors.
- Reviewed light/dark Home and dark Profile screenshots.

### Outstanding limitations

- Native iPhone/Android interactions and native system dialogs have not been rerun on physical devices. Verify System changes, keyboard contrast and native sheets using the existing Expo Go tunnel; native configuration changes need a new standalone build for release testing.
- The existing dependency audit still reports 43 findings (41 high, 2 moderate). No breaking forced dependency downgrade was applied.

## 2026-11-17 — Forma v0.3: first launch, adaptive onboarding and personalised Home

### Implemented

- Kept the existing Expo SDK 58, React Native, Expo Router, strict TypeScript, React Query, StyleSheet and local-storage architecture. Set the application version to 0.3.0.
- Added a dark `forma.` launch overlay with scale/opacity entrance, the tagline “Fitness that fits you.” and a smooth fade-out. Normal duration is approximately 1.75 seconds; Reduce Motion uses a short static presentation. The root-mounted overlay does not replay when navigating between screens.
- Added the SDK-compatible `expo-splash-screen` module and a matching dark native splash configuration. The native screen is released when the root view lays out, independently of local hydration success.
- Added one welcome screen explaining Learn, Plan, Train, Track, Manage nutrition and Connect, with fixed Get started / Resume and Skip & explore actions. Future nutrition tracking and partner matching are identified honestly.
- Replaced the training-only onboarding entry with multiple interests and conditional questions. Learning/exploring users avoid age and body-metric questions. Relevant paths collect weight goals, optional measurements, preferred units, activity estimates, learning topics and guidance, or training-together preferences.
- Added an explicit adult-eligibility choice for automatic training plans and personalised weight goals. This is a demo product scope, not a claim about legal eligibility. Declining to provide an age group or being under 18 skips those personalisation questions while preserving access to learning, manual tools and existing records. No location permissions are requested.
- Added a distinct typed fitness profile with interests, derived goals, experience, guidance, optional metrics, activity baseline, learning/community preferences, training settings and onboarding state. Existing routine, exercise and workout models are reused.
- Fixed a setup-completion navigation race by checking the latest cached profile when Home becomes focused, rather than redirecting from an outdated background render. Completed/skipped users are redirected out of Welcome, and setup exits dismiss back to the intended destination.
- Persisted valid choices, resume steps and customised optional plan previews locally. Back navigation and Explore for now retain progress. Previously completed users can edit their profile without being forced through onboarding after a restart.
- Preserved the existing deterministic generator as an optional part of training onboarding and as a separate training-setup route. Accepting a plan appends routines; finishing without a plan leaves the library and history intact. Existing accepted plans are preserved when interests change.
- Rebuilt Home around selected interests. Learning, weight, training, progress, nutrition and community sections are balanced for multiple interests. Added a universal Explore route so preferences affect presentation rather than feature access.
- Added six offline learning guides, optional source links, a nutrition education filter, and a clearly labelled future-community information page. Full nutrition tracking, live partner matching, messaging, AI and backend services remain unimplemented.
- Added metric/imperial body-weight entry, display and charts while retaining canonical kg/cm data. Profile starting weight and activity estimates are explicitly distinct from logged measurements and measured daily activity.
- New users start with no fabricated workouts or weight entries. Starter templates are labelled and become personal routines when explicitly saved or started. Previous mock records remain accessible as examples and are excluded from personal totals, charts and previous-performance comparisons.
- Added explicit v1-to-v2 payload migration under the existing `forma:v1` key. Existing arrays, accepted plans and active sessions are retained; migration is persisted with the next successful save.
- Added an eight-second hydration timeout, retry UI and a labelled session-only recovery mode. Session-only changes do not overwrite unreadable saved data or persist after closing the app.
- Updated the README with current behaviour, storage/migration details and device-testing requirements.

### Validation

- `npm run typecheck` and `npm run lint` passed.
- All **24 tests** passed, retaining the 14 existing tests and adding 10 profile/onboarding tests. New coverage includes all 127 non-empty interest combinations, adult-scope branches, legacy migration, exact record preservation, resumable plan drafts, optional acceptance, unit conversions, template adoption and honest Home summaries.
- Expo Doctor passed **20/20 checks** after adding the splash-screen module.
- Production JavaScript bundles compiled for **iOS, Android and web** on SDK 58.
- Mobile-browser checks at 390 × 844 verified normal and reduced-motion launch paths, no animation replay on navigation, welcome/skip/returning-user routing, saved onboarding resume, learner/nutrition and weight-management paths, imperial measurements, real weight logging, optional plan generation/customisation/acceptance, workout logging, legacy-user migration, age-aware questions and the informational community route. No runtime errors were recorded in those scenarios.
- The final regression rerun also verified skipping partway through setup and returning to the saved step, setup completion returning to Home, universal feature access regardless of interests, fixed welcome actions, and an imperial-unit weight trend rendered from two saved test measurements.
- Storage-failure and stalled-read browser simulations exposed recovery. A session-only weight entry left the original unreadable stored payload byte-for-byte unchanged.
- Reviewed screenshots of the branded launch, welcome, learner Home, training Home and combined-interest Home.

### Outstanding limitations and physical iPhone checks

- Native iPhone interaction has not been rerun for this update. Check cold launch, VoiceOver, Reduce Motion, fixed welcome actions, keyboard/safe-area layouts, backgrounding/termination and saved-step resume through the existing working Expo tunnel.
- A release build is required to verify the full native splash configuration; Expo Go does not faithfully reproduce every native splash property. The in-app animated wordmark is available in Expo Go.
- Valid choices and plan previews autosave; optional measurement/step text fields commit on Continue. Session-only mode is deliberately temporary and has no merge-back action.
- Dependency audit currently reports **43 findings (41 high, 2 moderate)**, principally propagated `picomatch` / `minimatch` denial-of-service advisories in the dependency tree. The suggested forced Expo downgrade is incompatible with the working SDK 58 client, so it was not applied. These upstream findings remain open and must be reviewed before release.

## 2026-11-17 — iPhone connection diagnosis and tunnel command

### Findings and implemented changes

- Checked internet connectivity outside the restricted sandbox: npm and Expo returned HTTP 200 in approximately 0.14–0.23 seconds. Sandbox DNS restrictions were not treated as evidence of a host internet outage.
- Confirmed the active Expo server on port 8081 serves an SDK 58 iOS manifest and JavaScript bundle successfully. Its advertised phone launch URL was `exp://172.21.235.156:8081`, and the host kernel identifies WSL2. This points to a potential phone-to-WSL routing issue rather than a failed local bundle.
- Tested Expo’s tunnel mode on isolated port 8082. Startup failed explicitly because Expo CLI is not signed in. Physical-iPhone Expo Go also requires the CLI and phone app to use the same Expo account.
- Added `npm run start:go:tunnel` (`expo start --go --tunnel`) and documented the sign-in and fresh-QR workflow, WSL networking, and the distinction between a repository link and a live development-server link.

### Validation

- The local iOS bundle request returned HTTP 200 (12,369,354 bytes).
- Tunnel-command execution was checked; it reached Metro startup and the explicit Expo sign-in requirement. A working external tunnel and phone connection have not yet been verified.
- Formatting checks passed. Application tests were not rerun for this scripts/documentation-only update.

### Outstanding limitations

- The developer must run `npx expo login` and sign in to the same account on the iPhone before the authenticated tunnel and physical-device launch can be tested.
- The full detailed error from the phone has not been provided. The WSL launch address and missing CLI sign-in are concrete findings, but the generic project-error message does not identify every possible cause.

## 2026-11-17 — Expo Go iPhone compatibility and SDK 58 upgrade

### Findings and implemented changes

- Investigated a reported complete Expo Go exit after scanning the QR code. The user confirmed Expo Go **58.0.5 / SDK 58** from the App Store on iOS **26.6.2**, while Forma targeted SDK 55. This confirmed a project/client compatibility mismatch; the device crash itself has not been reproduced locally.
- Expo Doctor also found two native font versions in the old installation: SDK 55's `expo-font@55.0.8` and a transitive SDK 58 version. Removed the mixed dependency tree through a clean, compatible installation.
- Upgraded Forma to Expo **58.0.26**, React Native **0.88.1**, React **19.3.0** and Expo Router **58.0.32**. Aligned the SDK-managed native packages, React types, TypeScript and ESLint configuration. Declared the Router native support packages explicitly to keep them aligned.
- Backed up the previous dependencies and lockfile under `/tmp` before the clean installation. Regenerated the project lockfile without bypassing npm peer-dependency checks.
- Migrated the shared scroll-view ref to React Native's strict instance type and explicitly included Node test types for TypeScript 6.
- Replaced the onboarding form's `watch()` call with a `useWatch` subscription to address the newer React Compiler lint warning.
- Added `npm run start:go` (`expo start --go --clear`) and documented Node requirements, restarting old Metro servers, matching Expo Go versions and collecting evidence if a native exit persists.
- Kept the Expo/React Native architecture, routes, features, app identity, local storage key and data schema intact.

### Validation

- Expo dependency compatibility check passed.
- Expo Doctor passed **20/20 checks**, including duplicate native modules.
- TypeScript, ESLint and formatting checks passed; all 14 regression tests passed on the new dependency stack.
- SDK 58 production bundles compiled for iOS, Android and web.
- An isolated Expo Go development server served an iOS manifest identifying SDK `58.0.0` and returned its development JavaScript bundle with HTTP 200. The server was stopped after the check.
- Mobile-browser regression checks passed for onboarding, plan acceptance, reload, equipment preferences and preference-only updates. No browser runtime errors were recorded.

### Outstanding limitations

- Opening the updated project on the reported physical iPhone remains to be confirmed. Local diagnostics cannot prove a native app-exit issue is resolved on that device.
- The refreshed dependency installation reports three moderate audit findings. No high-severity findings were reported in that installation result; remaining findings were not addressed with breaking forced upgrades.

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
