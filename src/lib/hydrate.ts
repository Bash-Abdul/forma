import { AppData, FitnessProfile } from '@/types';
import { preferencesSchema } from '@/features/onboarding/services/preferences';
import {
  fitnessProfileSchema,
  fromTrainingPreferences,
  initialFitnessProfile,
} from '@/features/profile/services/fitnessProfile';
/** v1 → v2 adds a distinct fitness profile. Existing record arrays and accepted plans remain intact. */
export function hydrateData(value: unknown): AppData {
  const raw = value as Omit<Partial<AppData>, 'version'> & { version?: number };
  if (
    !raw ||
    (raw.version !== 1 && raw.version !== 2) ||
    !Array.isArray(raw.routines) ||
    !Array.isArray(raw.workouts) ||
    !Array.isArray(raw.weights)
  )
    throw new Error('Unsupported local data.');
  const preferences = preferencesSchema.safeParse(raw.onboarding?.preferences);
  const status =
    raw.onboarding &&
    ['pending', 'skipped', 'complete'].includes(raw.onboarding.status)
      ? raw.onboarding.status
      : 'pending';
  const parsed = fitnessProfileSchema.safeParse(raw.fitnessProfile);
  let profile: FitnessProfile;
  if (parsed.success) profile = parsed.data;
  else if (raw.version === 2 && raw.fitnessProfile)
    throw new Error(
      'Your saved profile could not be read. Your records have been kept.',
    );
  else if (preferences.success)
    profile = fromTrainingPreferences(
      preferences.data,
      status === 'complete'
        ? 'complete'
        : status === 'skipped'
          ? 'skipped'
          : 'in-progress',
    );
  else
    profile = {
      ...initialFitnessProfile(),
      onboarding: {
        status:
          status === 'complete'
            ? 'complete'
            : status === 'skipped'
              ? 'skipped'
              : 'not-started',
        step: 'interests',
      },
    };
  return {
    ...raw,
    version: 2,
    appearance:
      raw.appearance === 'dark' || raw.appearance === 'light'
        ? raw.appearance
        : 'system',
    fitnessProfile: profile,
    routines: raw.routines,
    workouts: raw.workouts,
    weights: raw.weights,
    active: raw.active ?? null,
    onboarding: {
      ...raw.onboarding,
      status,
      preferences: preferences.success ? preferences.data : undefined,
    },
    demoRecords: raw.demoRecords ?? {
      workoutIds: raw.workouts
        .filter((w) => /^sample-[0-2]$/.test(w.id))
        .map((w) => w.id),
      weightIds: raw.weights
        .filter((w) => /^weight-[0-6]$/.test(w.id))
        .map((w) => w.id),
    },
  };
}
