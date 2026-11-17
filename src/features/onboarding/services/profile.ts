import { AppData, Routine, TrainingPreferences } from '@/types';
import { exerciseById } from '@/mocks/exercises';
import { validatePlan } from '@/features/routines/utils/validation';
import { GeneratedPlan } from './generator';
import { preferencesSchema } from './preferences';
/** Additive persistence: preferences and plans never replace existing training data. */
export function savePreferences(
  data: AppData,
  preferences: TrainingPreferences,
): AppData {
  return {
    ...data,
    onboarding: {
      ...data.onboarding,
      status: 'complete',
      preferences: preferencesSchema.parse(preferences),
    },
  };
}
export function skipOnboarding(data: AppData): AppData {
  if (data.onboarding?.status === 'complete') return data;
  return { ...data, onboarding: { ...data.onboarding, status: 'skipped' } };
}
export function acceptPlan(
  data: AppData,
  preferences: TrainingPreferences,
  plan: GeneratedPlan,
  acceptanceId: string,
): AppData {
  if (data.onboarding?.acceptedPlan?.id === acceptanceId) return data;
  const p = preferencesSchema.parse(preferences);
  if (plan.routines.length !== p.days)
    throw new Error('Keep one routine for each selected training day.');
  const days = new Set<number>();
  for (const routine of plan.routines) {
    if (
      !routine.name.trim() ||
      routine.name.length > 60 ||
      !Number.isInteger(routine.day) ||
      routine.day < 1 ||
      routine.day > 7 ||
      days.has(routine.day)
    )
      throw new Error(
        'Name each routine and choose a different day for each session.',
      );
    days.add(routine.day);
    const invalid = validatePlan(routine.exercises);
    if (invalid) throw new Error(`${routine.name}: ${invalid}`);
    if (
      new Set(routine.exercises.map((e) => e.exerciseId)).size !==
      routine.exercises.length
    )
      throw new Error('Choose different exercises within each routine.');
    for (const entry of routine.exercises) {
      const e = exerciseById(entry.exerciseId);
      if (
        !e ||
        !(
          e.equipment === 'Bodyweight' ||
          p.equipment.includes(
            e.equipment as TrainingPreferences['equipment'][number],
          )
        )
      )
        throw new Error(
          'Choose exercises that match your available equipment.',
        );
    }
  }
  const routines = plan.routines.map((r, i) => ({
    ...r,
    id: `${acceptanceId}-${i + 1}`,
    exercises: r.exercises.map((e) => ({ ...e })),
  }));
  return {
    ...savePreferences(data, p),
    routines: [...data.routines, ...routines],
    onboarding: {
      status: 'complete',
      preferences: p,
      acceptedPlan: {
        id: acceptanceId,
        title: plan.title,
        routineIds: routines.map((r) => r.id),
        days: p.days,
        acceptedAt: new Date().toISOString(),
      },
    },
  };
}
export function trainingRoutines(data: AppData): Routine[] {
  const ids = data.onboarding?.acceptedPlan?.routineIds;
  const current = ids ? data.routines.filter((r) => ids.includes(r.id)) : [];
  return current.length ? current : data.routines;
}
