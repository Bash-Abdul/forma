# Forma

A local-first fitness companion for iOS and Android, built with Expo, React Native, TypeScript and Expo Router.

See the [implementation log](CHANGELOG.md) for dated updates, delivered features, validation results and outstanding limitations.

## Run

Use Node.js 20.19+ (Node 24 recommended).

```sh
npm install
npm start
```

Open in an Expo SDK 55 compatible Expo Go client or use `npm run ios` / `npm run android` with a configured simulator. `npm run web` provides a browser preview.

```sh
npm run typecheck
npm run lint
npm test
```

## Included

- Guided onboarding for goals, experience, 2–5 training days, session duration, equipment and guidance level.
- Deterministic starting plans with explanations, editable drafts and explicit acceptance.
- A Profile tab for locally saved preferences; independent training can save preferences without accepting a plan.

- Dashboard with upcoming scheduled routine, actual weekly completion, recent sessions and weight.
- Editable four-day Upper/Lower sample programme. Create, reorder, configure and delete routines.
- 29 searchable exercises, muscle/equipment filters and execution guidance.
- Persisted active workout, previous exercise performance, editable sets and completed session history.
- Weight logging with validation, weight trend chart and training volume.

Routine templates and actual session sets are separate snapshots. Completing a workout saves completed sets only. A single active session can be resumed after restarting the app. All data, including initial examples, stays in AsyncStorage under the versioned `forma:v1` key. There are no accounts, backend services, remote APIs or image dependencies. Clearing app storage removes local records; cloud sync and export are not included.

Route files stay thin; screen implementations live in feature modules. `lib/store.tsx` is the asynchronous persistence boundary, backed by TanStack Query, and can be replaced with a repository/API implementation later. Initial example records use dates relative to first launch.

## Onboarding and plan rules

On first opening this version, new and existing users can complete onboarding or skip it. Existing v1 storage is read without resetting routines, workouts, weights or an active session. Preferences can be revisited from Profile.

The generator uses local movement templates and equipment rules. Two days use full-body sessions; three days use full-body sessions for beginners, general fitness or the lose-weight goal, and an upper/lower/full-body split otherwise. Four days use an upper/lower split. Five days use upper/lower plus a light technique day for beginners, or upper/lower/push/pull/legs for experienced users. Experience, goal and duration adjust sets, reps and exercise count. Equipment-free upper-back work is explicitly identified as a limited substitute for loaded pulling.

The review screen allows changing routine names, scheduled days, exercises, order, sets and target ranges. Drafts stay unsaved until acceptance; leaving the flow discards the draft. Accepting appends routines with new IDs, and the dashboard uses the latest accepted plan for its suggestions. Saving preferences alone never regenerates or edits routines. Independent mode opens the routine library instead of automatically starting a suggested workout.

The plan rules live in `src/features/onboarding/services/generator.ts`; persistence transformations live in `services/profile.ts`. Both reuse the existing routine and exercise models. The storage key remains `forma:v1`, with optional onboarding fields for backwards compatibility. No dependencies, backend services or external APIs were added for this feature.

### Beginner and experienced onboarding

Goals include Lose weight, Build strength, Build muscle and General fitness. Lose weight uses a repeatable strength-training foundation and does not promise a particular weight change.

Beginners receive definitions of training days and session duration, optional 3-day/45-minute demo defaults, equipment descriptions and a plain-language introduction to sets, reps and training splits. Intermediate and experienced users see concise scheduling and equipment choices. The 45-minute suggestion is a planning default, not a claim that every beginner needs a particular workout length; shorter sessions remain available. The emphasis on starting gradually is consistent with [NHS strength and flexibility guidance](https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/).

Equipment can be marked as “I’m not sure yet.” This preference is saved explicitly and generates an equipment-free starter plan using bodyweight movements; it never assumes access to a gym. Existing saved equipment selections remain valid and are not reset. The guidance-level step is unchanged.
