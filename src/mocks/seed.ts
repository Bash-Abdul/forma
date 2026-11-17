import { AppData, Routine, Workout } from '@/types';
const plan = (ids: string[]) =>
  ids.map((exerciseId) => ({ exerciseId, sets: 3, minReps: 8, maxReps: 12 }));
export function seedData(): AppData {
  const routines: Routine[] = [
    {
      id: 'upper-a',
      name: 'Upper body A',
      subtitle: 'Chest, back & shoulders',
      day: 1,
      exercises: plan([
        'bench',
        'row',
        'shoulder',
        'pulldown',
        'curl',
        'pushdown',
      ]),
    },
    {
      id: 'lower-a',
      name: 'Lower body A',
      subtitle: 'Quads, hamstrings & core',
      day: 2,
      exercises: plan(['squat', 'rdl', 'legpress', 'calf', 'plank']),
    },
    {
      id: 'upper-b',
      name: 'Upper body B',
      subtitle: 'Back, chest & arms',
      day: 4,
      exercises: plan([
        'incline',
        'pulldown',
        'row',
        'lateral',
        'curl',
        'pushdown',
      ]),
    },
    {
      id: 'lower-b',
      name: 'Lower body B',
      subtitle: 'Glutes, legs & core',
      day: 5,
      exercises: plan(['deadlift', 'lunge', 'legcurl', 'hip', 'calf', 'plank']),
    },
  ];
  const ago = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(17, 30, 0, 0);
    return d.toISOString();
  };
  const workouts: Workout[] = [8, 5, 2].map((days, i) => ({
    id: `sample-${i}`,
    routineId: routines[i].id,
    name: routines[i].name,
    startedAt: ago(days),
    finishedAt: new Date(
      new Date(ago(days)).getTime() + 48 * 60000,
    ).toISOString(),
    exercises: routines[i].exercises.map((p) => ({
      exerciseId: p.exerciseId,
      minReps: p.minReps,
      maxReps: p.maxReps,
      sets: Array.from({ length: p.sets }, (_, j) => ({
        id: `${i}-${p.exerciseId}-${j}`,
        weight:
          p.exerciseId === 'plank'
            ? '0'
            : p.exerciseId === 'bench'
              ? '60'
              : p.exerciseId === 'squat'
                ? '80'
                : '30',
        reps: p.exerciseId === 'plank' ? '30' : '10',
        completed: true,
      })),
    })),
  }));
  return {
    version: 1,
    routines,
    active: null,
    weights: [79.2, 78.9, 79.0, 78.5, 78.3, 78.1, 77.8].map((kg, i) => ({
      id: `weight-${i}`,
      date: ago((6 - i) * 7),
      kg,
    })),
    workouts,
  };
}
