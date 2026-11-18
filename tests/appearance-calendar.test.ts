import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAppearance, darkColors, lightColors } from '../src/theme';
import { hydrateData } from '../src/lib/hydrate';
import { initialData } from '../src/mocks/seed';
import { startWorkout } from '../src/lib/training';
import { weekOverview } from '../src/features/dashboard/services';

test('appearance follows the device only when System is selected', () => {
  assert.equal(resolveAppearance('system', 'dark'), 'dark');
  assert.equal(resolveAppearance(undefined, 'dark'), 'dark');
  assert.equal(resolveAppearance('system', null), 'light');
  assert.equal(resolveAppearance('light', 'dark'), 'light');
  assert.equal(resolveAppearance('dark', 'light'), 'dark');
  assert.deepEqual(Object.keys(lightColors), Object.keys(darkColors));
});

test('appearance survives hydration and defaults safely without changing records', () => {
  const original = initialData();
  for (const preference of ['dark', 'light', 'system'] as const) {
    const hydrated = hydrateData({ ...original, appearance: preference });
    assert.equal(hydrated.appearance, preference);
    assert.equal(hydrated.routines, original.routines);
    assert.equal(hydrated.workouts, original.workouts);
  }
  assert.equal(hydrateData(original).appearance, 'system');
  assert.equal(
    hydrateData({ ...original, appearance: 'invalid' }).appearance,
    'system',
  );
});

test('calendar uses local finish dates, excludes demo sessions and shows adopted schedules only', () => {
  const data = initialData();
  const now = new Date(2026, 10, 18, 12);
  const routine = data.routines[0];
  const finishedAt = new Date(2026, 10, 16, 23, 59).toISOString();
  const workout = { ...startWorkout(routine), id: 'actual', finishedAt };
  data.workouts = [
    workout,
    { ...workout, id: 'example', finishedAt: now.toISOString() },
    {
      ...workout,
      id: 'last-week',
      finishedAt: new Date(2026, 10, 15, 12).toISOString(),
    },
  ];
  data.demoRecords = { ...data.demoRecords!, workoutIds: ['example'] };
  let days = weekOverview(data, now);
  assert.equal(days.length, 7);
  assert.deepEqual(
    days.map((d) => d.date),
    [16, 17, 18, 19, 20, 21, 22],
  );
  assert.deepEqual(
    days.filter((d) => d.completed).map((d) => d.date),
    [16],
  );
  assert.equal(days.filter((d) => d.today)[0].date, 18);
  assert.equal(
    days.some((d) => d.scheduled),
    false,
  );
  data.demoRecords.routineIds = data.demoRecords.routineIds?.filter(
    (id) => id !== routine.id,
  );
  days = weekOverview(data, now);
  assert.equal(days[routine.day - 1].scheduled, true);
});
