import { AppData, WeightEntry, Workout } from '@/types';
export function personalWorkouts(data: AppData): Workout[] {
  return data.workouts.filter(
    (w) => !data.demoRecords?.workoutIds.includes(w.id),
  );
}
export function personalWeights(data: AppData): WeightEntry[] {
  return data.weights
    .filter((w) => !data.demoRecords?.weightIds.includes(w.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
