import { AppData, Routine, Workout } from '@/types';
export const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export function startWorkout(routine: Routine): Workout {
  return {
    id: uid(),
    routineId: routine.id,
    name: routine.name,
    startedAt: new Date().toISOString(),
    exercises: routine.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      minReps: e.minReps,
      maxReps: e.maxReps,
      sets: Array.from({ length: e.sets }, () => ({
        id: uid(),
        weight: '',
        reps: '',
        completed: false,
      })),
    })),
  };
}
export function validSet(weight: string, reps: string): boolean {
  return (
    weight.trim() !== '' &&
    Number.isFinite(Number(weight)) &&
    Number(weight) >= 0 &&
    /^\d+$/.test(reps) &&
    Number(reps) > 0 &&
    Number(reps) <= 999
  );
}
export function volume(workout: Workout): number {
  return workout.exercises.reduce(
    (total, e) =>
      total +
      e.sets
        .filter((s) => s.completed)
        .reduce((n, s) => n + Number(s.weight) * Number(s.reps), 0),
    0,
  );
}
export function weekStart(date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}
export function nextRoutine(routines: Routine[]): Routine | undefined {
  const today = (new Date().getDay() + 6) % 7;
  return [...routines].sort(
    (a, b) => ((a.day - 1 - today + 7) % 7) - ((b.day - 1 - today + 7) % 7),
  )[0];
}

/** Starter templates become personal routines only after an explicit save or session start. */
export function adoptRoutine(data: AppData, routineId: string): AppData {
  return {
    ...data,
    demoRecords: data.demoRecords
      ? {
          ...data.demoRecords,
          routineIds: data.demoRecords.routineIds?.filter(
            (id) => id !== routineId,
          ),
        }
      : undefined,
  };
}
export function activateRoutine(data: AppData, routine: Routine): AppData {
  return data.active
    ? data
    : { ...adoptRoutine(data, routine.id), active: startWorkout(routine) };
}
