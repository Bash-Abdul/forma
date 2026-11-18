import test from 'node:test';
import assert from 'node:assert/strict';
import { FitnessProfile } from '../src/types';
import { initialData, seedData } from '../src/mocks/seed';
import { hydrateData } from '../src/lib/hydrate';
import { personalWeights, personalWorkouts } from '../src/lib/records';
import { homeSections, homeSummary } from '../src/features/dashboard/services';
import {
  initialFitnessProfile,
  onboardingSteps,
  saveFitnessDraft,
  finishFitnessProfile,
  skipFitnessOnboarding,
  entryRoute,
  validateFitnessStep,
  canGeneratePlan,
} from '../src/features/profile/services/fitnessProfile';
import { defaultPreferences } from '../src/features/onboarding/services/preferences';
import { acceptPlan } from '../src/features/onboarding/services/profile';
import { generatePlan } from '../src/features/onboarding/services/generator';
import { activateRoutine, startWorkout } from '../src/lib/training';
import {
  toKg,
  toDisplayWeight,
  toCm,
  toDisplayHeight,
} from '../src/features/profile/services/measurements';
const adultTraining = (): FitnessProfile => ({
  ...initialFitnessProfile(),
  interests: ['training'],
  eligibility: 'adult',
  training: { ...defaultPreferences, equipmentKnowledge: 'known' },
});
test('new profiles have no invented personal workouts, weights or activity', () => {
  const data = initialData();
  assert.equal(data.version, 2);
  assert.deepEqual(data.workouts, []);
  assert.deepEqual(data.weights, []);
  assert.deepEqual(data.fitnessProfile.activity, {});
  assert.equal(homeSummary(data).latestWeight, undefined);
  assert.equal(homeSummary(data).next, undefined);
  const started = activateRoutine(data, data.routines[0]);
  assert.equal(homeSummary(started).next?.id, data.routines[0].id);
  assert.equal(
    activateRoutine(started, data.routines[1]).active?.id,
    started.active?.id,
  );
  assert.deepEqual(homeSections(data), ['explore']);
});
test('learning, nutrition and exploring do not request body measurements or a training plan', () => {
  for (const interests of [
    ['learn'],
    ['nutrition'],
    ['explore'],
    ['learn', 'nutrition'],
  ] as FitnessProfile['interests'][]) {
    const steps = onboardingSteps({ ...initialFitnessProfile(), interests });
    for (const hidden of [
      'metrics',
      'activity',
      'eligibility',
      'schedule',
      'equipment',
    ])
      assert.ok(!steps.includes(hidden as (typeof steps)[number]));
    assert.ok(steps.includes('review'));
  }
});
test('all interest combinations route through only relevant questions', () => {
  const all = [
    'learn',
    'weight',
    'training',
    'progress',
    'nutrition',
    'community',
    'explore',
  ] as const;
  for (let mask = 1; mask < 128; mask++) {
    const profile: FitnessProfile = {
      ...initialFitnessProfile(),
      interests: all.filter((_, i) => (mask & (1 << i)) !== 0),
      eligibility: 'adult',
    };
    const steps = onboardingSteps(profile);
    assert.equal(new Set(steps).size, steps.length);
    assert.equal(
      steps.includes('schedule'),
      profile.interests.includes('training'),
    );
    assert.equal(
      steps.includes('activity'),
      profile.interests.includes('weight'),
    );
    assert.equal(
      steps.includes('metrics'),
      profile.interests.includes('weight') ||
        profile.interests.includes('progress'),
    );
    assert.equal(
      steps.includes('community'),
      profile.interests.includes('community'),
    );
    assert.equal(
      steps.includes('learning'),
      profile.interests.includes('learn') ||
        profile.interests.includes('nutrition'),
    );
  }
});
test('adult eligibility gates automatic personalisation while leaving exploration available', () => {
  for (const eligibility of ['under18', 'unspecified'] as const) {
    const profile: FitnessProfile = {
      ...adultTraining(),
      interests: ['weight', 'training', 'learn'],
      eligibility,
      metrics: { weightKg: 60 },
    };
    const steps = onboardingSteps(profile);
    assert.equal(canGeneratePlan(profile), false);
    assert.ok(!steps.includes('metrics'));
    assert.ok(!steps.includes('schedule'));
    assert.ok(steps.includes('learning'));
    const complete = finishFitnessProfile(initialData(), profile);
    assert.deepEqual(complete.fitnessProfile.metrics, {});
    assert.equal(entryRoute(complete.fitnessProfile), '/');
  }
});
test('legacy migration preserves every record and accepted plan and avoids forced onboarding', () => {
  const legacy = seedData();
  legacy.active = startWorkout(legacy.routines[0]);
  const accepted = {
    id: 'previous',
    title: 'My existing plan',
    days: 4,
    routineIds: [legacy.routines[0].id],
    acceptedAt: '2026-11-01T12:00:00Z',
  };
  const { fitnessProfile, demoRecords, ...rest } = legacy;
  assert.ok(fitnessProfile);
  assert.ok(demoRecords);
  const original = {
    ...rest,
    version: 1,
    onboarding: {
      status: 'complete',
      preferences: defaultPreferences,
      acceptedPlan: accepted,
    },
  };
  const migrated = hydrateData(original);
  assert.equal(migrated.version, 2);
  assert.equal(entryRoute(migrated.fitnessProfile), '/');
  assert.deepEqual(migrated.fitnessProfile.interests, ['training']);
  for (const key of ['routines', 'workouts', 'weights', 'active'] as const)
    assert.deepEqual(migrated[key], legacy[key]);
  assert.deepEqual(migrated.onboarding?.acceptedPlan, accepted);
  assert.equal(personalWorkouts(migrated).length, 0);
  assert.equal(personalWeights(migrated).length, 0);
  assert.equal(migrated.workouts.length, 3);
  assert.equal(migrated.weights.length, 7);
});
test('draft answers and customised plan previews survive a storage round-trip without adding routines', () => {
  const original = initialData();
  const profile = adultTraining();
  const plan = generatePlan(profile.training!);
  plan.routines[0].name = 'My draft name';
  profile.onboarding.planDraft = { ...plan, id: 'draft-test' };
  const draft = saveFitnessDraft(original, profile, 'review');
  const reloaded = hydrateData(JSON.parse(JSON.stringify(draft)));
  assert.equal(reloaded.fitnessProfile.onboarding.step, 'review');
  assert.equal(
    reloaded.fitnessProfile.onboarding.planDraft?.routines[0].name,
    'My draft name',
  );
  assert.equal(entryRoute(reloaded.fitnessProfile), '/welcome');
  assert.deepEqual(reloaded.routines, original.routines);
  const skipped = skipFitnessOnboarding(reloaded);
  assert.equal(entryRoute(skipped.fitnessProfile), '/');
  assert.equal(skipped.fitnessProfile.onboarding.step, 'review');
});
test('completion never forces a plan; explicit acceptance remains additive and keeps history', () => {
  const original = seedData();
  original.active = startWorkout(original.routines[0]);
  const profile = adultTraining();
  const finished = finishFitnessProfile(original, profile);
  assert.equal(entryRoute(finished.fitnessProfile), '/');
  assert.deepEqual(finished.routines, original.routines);
  assert.deepEqual(finished.workouts, original.workouts);
  const plan = generatePlan(profile.training!);
  const withPlan = acceptPlan(finished, profile.training!, plan, 'v03-plan');
  assert.equal(withPlan.routines.length, original.routines.length + 3);
  assert.deepEqual(withPlan.workouts, original.workouts);
  assert.deepEqual(withPlan.weights, original.weights);
  assert.deepEqual(withPlan.active, original.active);
  const updated = finishFitnessProfile(withPlan, {
    ...profile,
    interests: ['learn', 'nutrition'],
  });
  assert.deepEqual(
    updated.onboarding?.acceptedPlan,
    withPlan.onboarding?.acceptedPlan,
  );
  assert.deepEqual(updated.routines, withPlan.routines);
  assert.equal(
    saveFitnessDraft(updated, updated.fitnessProfile, 'interests')
      .fitnessProfile.onboarding.status,
    'complete',
  );
});
test('multiple interests remain balanced and sample IDs do not hide real new records', () => {
  const data = seedData();
  data.fitnessProfile = {
    ...initialFitnessProfile(),
    interests: ['learn', 'weight', 'training', 'nutrition'],
    weightGoal: 'maintain',
  };
  data.weights.push({
    id: 'actual-weight',
    date: '2026-11-17T12:00:00Z',
    kg: 80,
  });
  const w = { ...data.workouts[0], id: 'actual-workout' };
  data.workouts.push(w);
  assert.deepEqual(homeSections(data), [
    'learn',
    'weight',
    'training',
    'nutrition',
  ]);
  assert.equal(homeSummary(data).weights.length, 1);
  assert.equal(homeSummary(data).workouts.length, 1);
  assert.equal(homeSummary(data).latestWeight?.kg, 80);
});
test('metric and imperial preferences preserve canonical values and validate optional inputs', () => {
  assert.ok(
    Math.abs(toKg(toDisplayWeight(80, 'imperial'), 'imperial') - 80) < 0.00001,
  );
  assert.ok(
    Math.abs(toCm(toDisplayHeight(170, 'imperial'), 'imperial') - 170) <
      0.00001,
  );
  const p: FitnessProfile = {
    ...initialFitnessProfile(),
    interests: ['weight'],
    eligibility: 'adult',
    weightGoal: 'lose',
  };
  assert.equal(validateFitnessStep(p, 'metrics'), null);
  assert.ok(validateFitnessStep({ ...p, metrics: { age: 12 } }, 'metrics'));
  assert.ok(
    validateFitnessStep(
      { ...p, metrics: { weightKg: 70, goalWeightKg: 80 } },
      'metrics',
    ),
  );
  assert.ok(
    validateFitnessStep({ ...p, activity: { steps: 2.5 } }, 'activity'),
  );
  assert.equal(
    validateFitnessStep({ ...p, activity: { steps: 0 } }, 'activity'),
    null,
  );
});
test('unsupported or malformed saved data is not silently reset', () => {
  assert.throws(() => hydrateData({ version: 99 }));
  assert.throws(() =>
    hydrateData({ ...initialData(), fitnessProfile: { broken: true } }),
  );
});
