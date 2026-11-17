import { PlannedExercise } from '@/types';
export function validatePlan(items: PlannedExercise[]): string | null {
  if (!items.length) return 'Add at least one exercise.';
  if (
    items.some(
      (e) =>
        !Number.isInteger(e.sets) ||
        e.sets < 1 ||
        e.sets > 10 ||
        !Number.isInteger(e.minReps) ||
        !Number.isInteger(e.maxReps) ||
        e.minReps < 1 ||
        e.maxReps < e.minReps ||
        e.maxReps > 999,
    )
  )
    return 'Use 1–10 sets and a valid rep range from 1–999.';
  return null;
}
