import { AppData, FitnessInterest } from '@/types';
import { personalWeights, personalWorkouts } from '@/lib/records';
import { nextRoutine, weekStart } from '@/lib/training';
import { trainingRoutines } from '@/features/onboarding/services/profile';
export function homeSections(data: AppData): FitnessInterest[] {
  const interests = data.fitnessProfile.interests;
  return interests.length ? [...new Set(interests)] : ['explore'];
}
export function homeSummary(data: AppData) {
  const weights = personalWeights(data);
  const workouts = personalWorkouts(data);
  return {
    weights,
    workouts,
    latestWeight: weights.at(-1),
    recent: [...workouts]
      .sort(
        (a, b) =>
          new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime(),
      )
      .slice(0, 3),
    weekly: workouts.filter((w) => new Date(w.finishedAt!) >= weekStart()),
    next: nextRoutine(
      trainingRoutines(data).filter(
        (r) => !data.demoRecords?.routineIds?.includes(r.id),
      ),
    ),
  };
}

/** Local calendar days; a completion counts only on its actual finish date. */
export function weekOverview(data: AppData, now = new Date()) {
  const start = weekStart(now);
  const workouts = personalWorkouts(data);
  const routines = trainingRoutines(data).filter(
    (r) => !data.demoRecords?.routineIds?.includes(r.id),
  );
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const key = date.toDateString();
    return {
      key,
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index],
      date: date.getDate(),
      today: key === now.toDateString(),
      completed: workouts.some(
        (w) => w.finishedAt && new Date(w.finishedAt).toDateString() === key,
      ),
      scheduled: routines.some((r) => r.day === index + 1),
    };
  });
}
