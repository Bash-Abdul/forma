import { z } from 'zod';
import {
  AppData,
  FitnessGoal,
  FitnessProfile,
  FitnessStep,
  TrainingPreferences,
} from '@/types';
import { preferencesSchema } from '@/features/onboarding/services/preferences';
export const interests = [
  {
    value: 'learn',
    label: 'Learn about fitness',
    detail: 'Understand the basics, one topic at a time.',
  },
  {
    value: 'weight',
    label: 'Manage my weight',
    detail: 'Lose, gain or maintain weight, with space to track changes.',
  },
  {
    value: 'training',
    label: 'Start or improve training',
    detail: 'Build a plan, learn movements or improve your routine.',
  },
  {
    value: 'progress',
    label: 'Track my progress',
    detail: 'Keep a record of weight and the training you do.',
  },
  {
    value: 'nutrition',
    label: 'Understand nutrition',
    detail: 'Learn about food, calories and macronutrients.',
  },
  {
    value: 'community',
    label: 'Find a fitness buddy',
    detail: 'Tell us how you like to train. Partner matching is coming later.',
  },
  {
    value: 'explore',
    label: 'Just exploring',
    detail: 'Look around and decide what matters to you.',
  },
] as const;
export const fitnessProfileSchema = z.object({
  version: z.literal(1),
  interests: z.array(
    z.enum([
      'learn',
      'weight',
      'training',
      'progress',
      'nutrition',
      'community',
      'explore',
    ]),
  ),
  goals: z.array(
    z.enum([
      'learn-fundamentals',
      'lose-weight',
      'gain-weight',
      'maintain-weight',
      'build-strength',
      'build-muscle',
      'improve-fitness',
      'track-progress',
      'understand-nutrition',
      'find-partners',
      'explore',
    ]),
  ),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  guidance: z.enum(['guided', 'flexible', 'independent']),
  eligibility: z.enum(['adult', 'under18', 'unspecified']).optional(),
  units: z.enum(['metric', 'imperial']),
  weightGoal: z.enum(['lose', 'gain', 'maintain']).optional(),
  metrics: z.object({
    age: z.number().int().min(18).max(120).optional(),
    heightCm: z.number().min(80).max(250).optional(),
    weightKg: z.number().min(20).max(500).optional(),
    goalWeightKg: z.number().min(20).max(500).optional(),
  }),
  activity: z.object({
    level: z.enum(['sedentary', 'light', 'moderate', 'active']).optional(),
    steps: z.number().int().min(0).max(100000).optional(),
  }),
  weightSupport: z.object({ nutrition: z.boolean(), activity: z.boolean() }),
  learning: z.object({
    topics: z.array(
      z.enum([
        'fundamentals',
        'strength',
        'consistency',
        'weight',
        'nutrition',
      ]),
    ),
    guidance: z.enum(['more', 'balanced', 'less']),
  }),
  community: z.object({
    style: z.enum(['partner', 'group', 'solo', 'undecided']).optional(),
    setting: z.enum(['gym', 'home', 'outdoors', 'any']).optional(),
  }),
  training: preferencesSchema.optional(),
  onboarding: z.object({
    status: z.enum(['not-started', 'in-progress', 'complete', 'skipped']),
    step: z.enum([
      'interests',
      'experience',
      'eligibility',
      'weight-goal',
      'metrics',
      'activity',
      'learning',
      'community',
      'training-goal',
      'schedule',
      'equipment',
      'review',
    ]),
    updatedAt: z.string().optional(),
    planDraft: z
      .object({
        id: z.string(),
        title: z.string(),
        explanation: z.array(z.string()),
        routines: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            subtitle: z.string(),
            day: z.number(),
            exercises: z.array(
              z.object({
                exerciseId: z.string(),
                sets: z.number(),
                minReps: z.number(),
                maxReps: z.number(),
              }),
            ),
          }),
        ),
      })
      .optional(),
  }),
});
export function initialFitnessProfile(): FitnessProfile {
  return {
    version: 1,
    interests: [],
    goals: [],
    experience: 'beginner',
    guidance: 'guided',
    units: 'metric',
    metrics: {},
    activity: {},
    weightSupport: { nutrition: false, activity: false },
    learning: { topics: [], guidance: 'more' },
    community: {},
    onboarding: { status: 'not-started', step: 'interests' },
  };
}
export function deriveGoals(p: FitnessProfile): FitnessGoal[] {
  const goals: FitnessGoal[] = [];
  if (p.interests.includes('learn')) goals.push('learn-fundamentals');
  if (p.interests.includes('weight') && p.weightGoal)
    goals.push(
      p.weightGoal === 'lose'
        ? 'lose-weight'
        : p.weightGoal === 'gain'
          ? 'gain-weight'
          : 'maintain-weight',
    );
  if (p.interests.includes('training') && p.training)
    goals.push(
      p.training.goal === 'strength'
        ? 'build-strength'
        : p.training.goal === 'muscle'
          ? 'build-muscle'
          : p.training.goal === 'weight-loss'
            ? 'lose-weight'
            : 'improve-fitness',
    );
  if (p.interests.includes('progress')) goals.push('track-progress');
  if (p.interests.includes('nutrition')) goals.push('understand-nutrition');
  if (p.interests.includes('community')) goals.push('find-partners');
  if (p.interests.includes('explore')) goals.push('explore');
  return [...new Set(goals)];
}
export function canGeneratePlan(p: FitnessProfile): boolean {
  return p.eligibility === 'adult';
}
export function onboardingSteps(p: FitnessProfile): FitnessStep[] {
  const has = (interest: FitnessProfile['interests'][number]) =>
    p.interests.includes(interest);
  const steps: FitnessStep[] = ['interests', 'experience'];
  if (has('training') || has('weight') || has('progress'))
    steps.push('eligibility');
  if (p.eligibility === 'adult') {
    if (has('weight')) steps.push('weight-goal');
    if (has('weight') || has('progress')) steps.push('metrics');
    if (has('weight')) steps.push('activity');
  }
  if (has('learn') || has('nutrition')) steps.push('learning');
  if (has('community')) steps.push('community');
  if (has('training') && canGeneratePlan(p))
    steps.push('training-goal', 'schedule', 'equipment');
  steps.push('review');
  return steps;
}
export function validateFitnessStep(
  p: FitnessProfile,
  step: FitnessStep,
): string | null {
  if (step === 'interests' && !p.interests.length)
    return 'Choose at least one interest, or choose Just exploring.';
  if (step === 'eligibility' && !p.eligibility)
    return 'Choose an age group. You can also choose not to say.';
  if (step === 'weight-goal' && !p.weightGoal)
    return 'Choose whether you want to lose, gain or maintain weight.';
  if (step === 'metrics') {
    const result = fitnessProfileSchema.shape.metrics.safeParse(p.metrics);
    if (!result.success)
      return 'Check your measurements: age 18–120, height 80–250 cm, and weight 20–500 kg (or their equivalent in your units).';
    const { weightKg, goalWeightKg } = p.metrics;
    if (
      weightKg !== undefined &&
      goalWeightKg !== undefined &&
      p.weightGoal === 'lose' &&
      goalWeightKg >= weightKg
    )
      return 'For a lose-weight goal, goal weight should be below current weight. You can leave it blank.';
    if (
      weightKg !== undefined &&
      goalWeightKg !== undefined &&
      p.weightGoal === 'gain' &&
      goalWeightKg <= weightKg
    )
      return 'For a gain-weight goal, goal weight should be above current weight. You can leave it blank.';
  }
  if (
    step === 'activity' &&
    !fitnessProfileSchema.shape.activity.safeParse(p.activity).success
  )
    return 'Enter a whole-number daily step estimate between 0 and 100,000, or leave it blank.';
  if (
    ['training-goal', 'schedule', 'equipment'].includes(step) &&
    (!p.training || !preferencesSchema.safeParse(p.training).success)
  )
    return 'Check your training preferences and choose at least one equipment option.';
  return null;
}
export function saveFitnessDraft(
  data: AppData,
  profile: FitnessProfile,
  step: FitnessStep,
): AppData {
  return {
    ...data,
    fitnessProfile: {
      ...profile,
      goals: deriveGoals(profile),
      onboarding: {
        ...profile.onboarding,
        status:
          data.fitnessProfile.onboarding.status === 'complete'
            ? 'complete'
            : 'in-progress',
        step,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}
export function finishFitnessProfile(
  data: AppData,
  profile: FitnessProfile,
): AppData {
  const parsed = fitnessProfileSchema.parse(profile);
  for (const step of onboardingSteps(parsed)) {
    const error = validateFitnessStep(parsed, step);
    if (error) throw new Error(error);
  }
  // Do not retain new body metrics for users who have not confirmed adult eligibility.
  const final: FitnessProfile = {
    ...parsed,
    goals: deriveGoals(parsed),
    metrics: parsed.eligibility === 'adult' ? parsed.metrics : {},
    onboarding: {
      status: 'complete',
      step: 'review',
      updatedAt: new Date().toISOString(),
    },
  };
  return {
    ...data,
    fitnessProfile: final,
    onboarding: {
      ...data.onboarding,
      status: 'complete',
      preferences: final.training ?? data.onboarding?.preferences,
    },
  };
}
export function skipFitnessOnboarding(
  data: AppData,
  profile = data.fitnessProfile,
): AppData {
  const status =
    data.fitnessProfile.onboarding.status === 'complete'
      ? 'complete'
      : 'skipped';
  return {
    ...data,
    fitnessProfile: {
      ...profile,
      goals: deriveGoals(profile),
      onboarding: {
        ...profile.onboarding,
        status,
        updatedAt: new Date().toISOString(),
      },
    },
    onboarding: {
      ...data.onboarding,
      status: data.onboarding?.status === 'complete' ? 'complete' : 'skipped',
    },
  };
}
export function entryRoute(p: FitnessProfile): '/' | '/welcome' {
  return p.onboarding.status === 'complete' || p.onboarding.status === 'skipped'
    ? '/'
    : '/welcome';
}
export function fromTrainingPreferences(
  p: TrainingPreferences,
  status: FitnessProfile['onboarding']['status'],
): FitnessProfile {
  const base = initialFitnessProfile();
  const profile: FitnessProfile = {
    ...base,
    interests: p.goal === 'weight-loss' ? ['training', 'weight'] : ['training'],
    experience: p.experience,
    guidance: p.guidance,
    training: p,
    weightGoal: p.goal === 'weight-loss' ? 'lose' : undefined,
    onboarding: { status, step: 'interests' },
  };
  return { ...profile, goals: deriveGoals(profile) };
}
