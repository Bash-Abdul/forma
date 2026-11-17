import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePlan,
  availableExercises,
} from '../src/features/onboarding/services/generator';
import {
  defaultPreferences,
  preferencesSchema,
} from '../src/features/onboarding/services/preferences';
import {
  acceptPlan,
  savePreferences,
  skipOnboarding,
  trainingRoutines,
} from '../src/features/onboarding/services/profile';
import { hydrateData } from '../src/lib/hydrate';
import { seedData } from '../src/mocks/seed';
import { startWorkout } from '../src/lib/training';
import { exerciseById } from '../src/mocks/exercises';
import { TrainingPreferences } from '../src/types';
const allEquipment: TrainingPreferences['equipment'] = [
  'Bodyweight',
  'Dumbbell',
  'Barbell',
  'Cable',
  'Machine',
];
const base: TrainingPreferences = {
  ...defaultPreferences,
  equipment: allEquipment,
  equipmentKnowledge: 'known',
};
test('same preferences produce identical plans without mutating inputs', () => {
  const before = JSON.stringify(base);
  assert.deepEqual(generatePlan(base), generatePlan(base));
  assert.equal(JSON.stringify(base), before);
});
test('split matches time and experience for every supported day count', () => {
  assert.match(generatePlan({ ...base, days: 2 }).title, /full body/);
  assert.match(generatePlan({ ...base, days: 3 }).title, /full body/);
  assert.match(
    generatePlan({
      ...base,
      days: 3,
      experience: 'intermediate',
      goal: 'muscle',
    }).title,
    /upper \/ lower \/ full body/,
  );
  assert.match(generatePlan({ ...base, days: 4 }).title, /upper \/ lower/);
  const beginner = generatePlan({ ...base, days: 5 });
  assert.match(beginner.title, /technique/);
  assert.equal(beginner.routines[4].exercises.length, 3);
  assert.ok(beginner.routines[4].exercises.every((e) => e.sets === 2));
  assert.match(
    generatePlan({ ...base, days: 5, experience: 'advanced' }).title,
    /push \/ pull \/ legs/,
  );
});
test('all equipment subsets, goals, durations and experience levels yield valid usable routines', () => {
  for (let mask = 1; mask < 32; mask++)
    for (const days of [2, 3, 4, 5] as const)
      for (const experience of [
        'beginner',
        'intermediate',
        'advanced',
      ] as const)
        for (const goal of [
          'strength',
          'muscle',
          'fitness',
          'weight-loss',
        ] as const)
          for (const duration of [30, 45, 60] as const) {
            const preferences: TrainingPreferences = {
              ...base,
              equipment: allEquipment.filter((_, i) => (mask & (1 << i)) !== 0),
              days,
              experience,
              goal,
              duration,
            };
            const plan = generatePlan(preferences);
            assert.equal(plan.routines.length, days);
            assert.equal(new Set(plan.routines.map((r) => r.day)).size, days);
            for (const routine of plan.routines) {
              assert.ok(routine.exercises.length >= 3);
              assert.ok(
                routine.exercises.length <=
                  (duration === 30 ? 4 : duration === 45 ? 5 : 6),
              );
              assert.equal(
                new Set(routine.exercises.map((e) => e.exerciseId)).size,
                routine.exercises.length,
              );
              for (const entry of routine.exercises) {
                const exercise = exerciseById(entry.exerciseId);
                assert.ok(exercise);
                assert.ok(
                  exercise.equipment === 'Bodyweight' ||
                    preferences.equipment.includes(
                      exercise.equipment as TrainingPreferences['equipment'][number],
                    ),
                );
                assert.ok(entry.sets >= 2 && entry.sets <= 4);
                assert.ok(entry.minReps > 0 && entry.minReps <= entry.maxReps);
              }
            }
          }
});
test('goals and time budgets change load targets and volume', () => {
  const strength = generatePlan({
    ...base,
    goal: 'strength',
    experience: 'advanced',
    duration: 60,
  });
  assert.ok(
    strength.routines[0].exercises.some(
      (e) => e.minReps === 5 && e.maxReps === 8,
    ),
  );
  assert.ok(strength.routines[0].exercises.every((e) => e.sets === 4));
  const short = generatePlan({ ...base, duration: 30 });
  assert.ok(
    short.routines.every(
      (r) => r.exercises.length <= 4 && r.exercises.every((e) => e.sets === 2),
    ),
  );
  const fitness = generatePlan(base);
  assert.ok(
    fitness.routines
      .flatMap((r) => r.exercises)
      .filter((e) => e.exerciseId !== 'plank')
      .every((e) => e.minReps === 10),
  );
});
test('legacy hydration, skip and preference updates preserve every training record', () => {
  const original = seedData();
  original.active = startWorkout(original.routines[0]);
  const copy = JSON.parse(JSON.stringify(original));
  const migrated = hydrateData(copy);
  assert.equal(migrated.onboarding?.status, 'pending');
  const skipped = skipOnboarding(migrated);
  assert.equal(skipped.onboarding?.status, 'skipped');
  const updated = savePreferences(skipped, base);
  for (const key of ['routines', 'workouts', 'weights', 'active'] as const)
    assert.deepEqual(updated[key], original[key]);
  assert.equal(updated.onboarding?.preferences?.days, 3);
});
test('review is unsaved; acceptance appends customised routines and supports existing workout logging', () => {
  const original = seedData();
  original.active = startWorkout(original.routines[0]);
  const before = JSON.stringify(original);
  const draft = generatePlan(base);
  draft.routines[0].name = 'My full body';
  draft.routines[0].exercises[0].sets = 3;
  assert.equal(JSON.stringify(original), before);
  const accepted = acceptPlan(original, base, draft, 'acceptance-1');
  assert.equal(accepted.routines.length, original.routines.length + 3);
  assert.deepEqual(
    accepted.routines.slice(0, original.routines.length),
    original.routines,
  );
  assert.deepEqual(accepted.workouts, original.workouts);
  assert.deepEqual(accepted.active, original.active);
  assert.deepEqual(accepted.weights, original.weights);
  assert.equal(skipOnboarding(accepted), accepted);
  assert.deepEqual(hydrateData(JSON.parse(JSON.stringify(accepted))), accepted);
  assert.equal(trainingRoutines(accepted)[0].name, 'My full body');
  assert.equal(
    startWorkout(trainingRoutines(accepted)[0]).exercises[0].sets.length,
    3,
  );
  assert.equal(acceptPlan(accepted, base, draft, 'acceptance-1'), accepted);
  const newPrefs = savePreferences(accepted, { ...base, days: 2 });
  assert.deepEqual(newPrefs.routines, accepted.routines);
  assert.deepEqual(
    newPrefs.onboarding?.acceptedPlan,
    accepted.onboarding?.acceptedPlan,
  );
  const second = acceptPlan(
    newPrefs,
    { ...base, days: 2 },
    generatePlan({ ...base, days: 2 }),
    'acceptance-2',
  );
  assert.equal(second.routines.length, accepted.routines.length + 2);
  assert.equal(
    new Set(second.routines.map((r) => r.id)).size,
    second.routines.length,
  );
});
test('invalid preferences and invalid customised plans cannot be accepted', () => {
  assert.equal(
    preferencesSchema.safeParse({ ...base, days: 1 }).success,
    false,
  );
  assert.equal(
    preferencesSchema.safeParse({ ...base, equipment: [] }).success,
    false,
  );
  const bad = generatePlan(base);
  bad.routines[0].exercises[0].maxReps = 0;
  assert.throws(() => acceptPlan(seedData(), base, bad, 'bad'));
  const clash = generatePlan(base);
  clash.routines[1].day = clash.routines[0].day;
  assert.throws(() => acceptPlan(seedData(), base, clash, 'clash'));
  const empty = generatePlan(base);
  empty.routines[0].exercises = [];
  assert.throws(() => acceptPlan(seedData(), base, empty, 'empty'));
  const missing = generatePlan(base);
  missing.routines[0].exercises[0].exerciseId = 'missing';
  assert.throws(() => acceptPlan(seedData(), base, missing, 'missing'));
  const bodyweight = {
    ...base,
    equipment: ['Bodyweight'] as TrainingPreferences['equipment'],
  };
  assert.ok(
    availableExercises(bodyweight).every((e) => e.equipment === 'Bodyweight'),
  );
  const wrongEquipment = generatePlan(bodyweight);
  wrongEquipment.routines[0].exercises[0].exerciseId = 'bench';
  assert.throws(() =>
    acceptPlan(seedData(), bodyweight, wrongEquipment, 'wrong'),
  );
});

test('lose-weight goal generates valid repeatable full-body plans and persists in Profile data', () => {
  const preferences: TrainingPreferences = {
    ...base,
    goal: 'weight-loss',
    experience: 'intermediate',
    days: 3,
  };
  const plan = generatePlan(preferences);
  assert.match(plan.title, /full body/);
  assert.ok(plan.explanation.some((text) => text.includes('lose-weight goal')));
  assert.ok(
    plan.routines
      .flatMap((r) => r.exercises)
      .filter((e) => e.exerciseId !== 'plank')
      .every((e) => e.minReps === 10 && e.maxReps === 15),
  );
  const accepted = acceptPlan(seedData(), preferences, plan, 'weight-loss');
  assert.equal(
    hydrateData(JSON.parse(JSON.stringify(accepted))).onboarding?.preferences
      ?.goal,
    'weight-loss',
  );
});
test('equipment uncertainty persists honestly and cannot imply access to gym equipment', () => {
  const preferences: TrainingPreferences = {
    ...base,
    equipmentKnowledge: 'unsure',
    equipment: ['Bodyweight'],
  };
  const plan = generatePlan(preferences);
  assert.ok(
    plan.routines
      .flatMap((r) => r.exercises)
      .every((e) => exerciseById(e.exerciseId).equipment === 'Bodyweight'),
  );
  assert.ok(
    plan.explanation.some((text) => text.includes('not sure about equipment')),
  );
  assert.equal(
    preferencesSchema.safeParse({ ...preferences, equipment: ['Machine'] })
      .success,
    false,
  );
  const data = savePreferences(seedData(), preferences);
  assert.equal(
    hydrateData(JSON.parse(JSON.stringify(data))).onboarding?.preferences
      ?.equipmentKnowledge,
    'unsure',
  );
  const { equipmentKnowledge, ...legacy } = base;
  assert.equal(equipmentKnowledge, 'known');
  assert.equal(preferencesSchema.safeParse(legacy).success, true);
  assert.deepEqual(
    hydrateData({
      ...seedData(),
      onboarding: { status: 'complete', preferences: legacy },
    }).onboarding?.preferences,
    legacy,
  );
});
