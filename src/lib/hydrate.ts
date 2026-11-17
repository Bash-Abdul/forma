import { AppData } from '@/types';
import { preferencesSchema } from '@/features/onboarding/services/preferences';
/** Older v1 records did not contain onboarding; preserve every existing training record. */
export function hydrateData(value: unknown): AppData {
  const data = value as AppData;
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.routines) ||
    !Array.isArray(data.workouts) ||
    !Array.isArray(data.weights)
  )
    throw new Error('Unsupported local data.');
  const onboarding = data.onboarding;
  const preferences = preferencesSchema.safeParse(onboarding?.preferences);
  return {
    ...data,
    onboarding: {
      ...onboarding,
      status:
        onboarding &&
        ['pending', 'skipped', 'complete'].includes(onboarding.status)
          ? onboarding.status
          : 'pending',
      preferences: preferences.success ? preferences.data : undefined,
    },
  };
}
