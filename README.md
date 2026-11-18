# Forma v0.3

A local-first fitness companion for iOS and Android. Learn, plan, train and track at your own pace, with educational nutrition guides and a clearly labelled preview of future community features.

See the dated [implementation log](CHANGELOG.md) and [iPhone testing guide](docs/iphone-testing.md).

## Run

Use Node.js 24.3+ on the Node 24 line (recommended), or Node 22.13+ on the Node 22 line. The project targets Expo SDK 58.

```sh
npm install
npm start
```

For the existing iPhone/WSL workflow, sign in to the same Expo account in the CLI and Expo Go, then use the tunnel:

```sh
npx expo login
npm run start:go:tunnel
```

`npm run start:go` starts Expo Go with a cleared Metro cache after SDK changes. `npm run web` opens a browser preview. Do not delete Expo Go or clear app storage to update Forma.

## What works

- Bundled Barlow Condensed headings/numbers paired with DM Sans reading and controls, with native/browser fallbacks if font loading fails.

- A weekly workout calendar and green Home feature panel, with simpler lists and less decorative UI.
- Saved **Light / Dark / System** appearance in **Profile → Appearance**. System follows device changes; explicit choices override it. Existing installs default to System and keep their records.

- A dark branded launch with a short wordmark entrance/fade and a reduced-motion alternative. It runs once per app launch, not during navigation.
- One welcome screen with Get started, Resume setup and Skip & explore actions.
- Adaptive onboarding for multiple interests: learning, weight management, training, progress, nutrition, community and exploring. Questions depend on the selected interests.
- Optional body measurements, metric/imperial preferences, lose/gain/maintain goals, an activity baseline, learning topics and training-together preferences. Learning/exploring paths do not ask for body measurements.
- Locally saved answers and resumable plan drafts. Training plan generation and acceptance are optional. Existing four-day Upper/Lower templates remain in the routine library.
- Home sections shaped by interests. Personal figures use actual saved records; profile baselines and activity estimates are labelled separately.
- Six offline learning guides, exercise search/filtering, routine editing, deterministic 2–5-day plan generation, workout logging/resume/history, weight logging and charts.
- Profile editing and a universal Explore screen. Selecting interests changes Home, not access to other features.

Nutrition is educational only: there is no meal tracking, calorie-target calculation or macro prescription. Community is informational only: no live users, matching, messages or location permissions. There is no backend, app authentication, external AI or remote content API.

## Data and migrations

Data stays in AsyncStorage under the existing **`forma:v1` key**. The value now uses **schema version 2**, with a distinct typed fitness profile alongside existing routines, workouts and weight entries. Legacy v1 payloads are migrated on read and written in the new format on the next successful save. Previously completed or skipped users are not forced through onboarding.

New users have empty workout and weight history. Starter routines are labelled templates and become personal routines when explicitly saved or started. Older sample records remain accessible and are labelled as examples; they are excluded from personal totals, trends and previous-performance comparisons. Migration does not delete historical records or replace accepted plans.

Measurements are canonical kg/cm internally and converted for display/input. Profile starting weight is separate from logged history. Optional measurements save when Continue is pressed; other valid choices and plan previews save locally as the user goes. Changes to profile preferences never regenerate existing routines automatically.

Automatic personalised plans and weight goals are scoped to adults 18+ in this demo. Users may decline to provide an age group and continue exploring. This product scope is not presented as a legal age requirement; manual features and existing records remain accessible.

If storage fails or does not respond within eight seconds, the app provides Retry and a clearly labelled session-only mode. Session-only changes never overwrite unreadable saved records and are not retained after closing the app. There is no cloud sync or export; clearing app storage removes local data.

Route files stay thin. Feature services contain profile validation, conditional steps, migration and plan rules. TanStack Query and `lib/store.tsx` provide the asynchronous persistence boundary.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor@latest
npx expo export --platform all
```

Tests cover existing training rules, conditional onboarding, migration and record preservation, draft persistence, age-aware personalisation, units and honest Home summaries. See the implementation log for the checks actually run for each update.

Native splash configuration requires a release build for a faithful preview; [Expo Go does not fully replicate it](https://docs.expo.dev/versions/latest/sdk/splash-screen/). The animated in-app launch can still be viewed in Expo Go. Physical iPhone checks remain necessary for cold launch, VoiceOver, Reduce Motion, keyboard/safe-area layouts and app termination/resume.
