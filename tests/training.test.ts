import test from 'node:test';
import assert from 'node:assert/strict';
import { startWorkout, validSet, volume, weekStart } from '../src/lib/training';
import { seedData } from '../src/mocks/seed';
import { finishWorkout } from '../src/features/workouts/services/session';
import { validatePlan } from '../src/features/routines/utils/validation';
test('sessions are independent snapshots of planned routines', () => {
  const routine = seedData().routines[0];
  const workout = startWorkout(routine);
  workout.exercises[0].sets.push({
    id: 'extra',
    weight: '60',
    reps: '8',
    completed: true,
  });
  assert.equal(routine.exercises[0].sets, 3);
  assert.equal(workout.exercises[0].sets.length, 4);
  assert.equal(volume(workout), 480);
  assert.equal(workout.finishedAt, undefined);
});
test('validates actual set performance including bodyweight', () => {
  assert.equal(validSet('0', '12'), true);
  for (const [w, r] of [
    ['', '12'],
    ['-1', '12'],
    ['abc', '2'],
    ['20', '0'],
    ['20', '2.5'],
    ['20', '1000'],
  ])
    assert.equal(validSet(w, r), false);
});
test('weekly completion uses local Monday boundary', () => {
  const monday = weekStart(new Date(2026, 10, 22, 17));
  assert.equal(monday.getDay(), 1);
  assert.equal(monday.getHours(), 0);
  assert.equal(monday.getDate(), 16);
});
test('finishing keeps completed performance and preserves its source routine', () => {
  const data = seedData();
  const template = JSON.stringify(data.routines);
  data.active = startWorkout(data.routines[0]);
  const id = data.active.id;
  data.active.exercises[0].sets[0] = {
    id: 'done',
    weight: '60',
    reps: '8',
    completed: true,
  };
  const next = finishWorkout(data, id);
  assert.equal(next.active, null);
  assert.equal(next.workouts.at(-1)?.exercises.length, 1);
  assert.equal(next.workouts.at(-1)?.exercises[0].sets.length, 1);
  assert.equal(JSON.stringify(next.routines), template);
  assert.notEqual(data.active, null);
  assert.throws(() => finishWorkout(next, id));
});
test('empty sessions and inverted planned rep ranges cannot be saved', () => {
  const data = seedData();
  data.active = startWorkout(data.routines[0]);
  assert.throws(() => finishWorkout(data, data.active!.id));
  assert.ok(
    validatePlan([{ exerciseId: 'bench', sets: 3, minReps: 12, maxReps: 8 }]),
  );
  assert.equal(validatePlan(data.routines[0].exercises), null);
});
