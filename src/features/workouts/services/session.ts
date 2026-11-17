import { AppData, Workout } from '@/types';
import { validSet } from '@/lib/training';
/** Only completed actual performance is retained; the reusable template is untouched. */
export function finishWorkout(data: AppData, expectedId: string): AppData {
  const active = data.active;
  if (!active || active.id !== expectedId)
    throw new Error('The active session has changed.');
  const exercises = active.exercises
    .map((e) => ({ ...e, sets: e.sets.filter((s) => s.completed) }))
    .filter((e) => e.sets.length);
  if (!exercises.length)
    throw new Error('Complete at least one set before finishing.');
  if (exercises.some((e) => e.sets.some((s) => !validSet(s.weight, s.reps))))
    throw new Error('A completed set has invalid performance.');
  const finished: Workout = {
    ...active,
    exercises,
    finishedAt: new Date().toISOString(),
  };
  return { ...data, workouts: [...data.workouts, finished], active: null };
}
