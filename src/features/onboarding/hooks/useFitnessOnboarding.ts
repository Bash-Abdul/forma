import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import {
  FitnessProfile,
  FitnessStep,
  Routine,
  TrainingPreferences,
} from '@/types';
import { useData, useSave } from '@/lib/store';
import { uid } from '@/lib/training';
import { defaultPreferences } from '../services/preferences';
import { generatePlan } from '../services/generator';
import { acceptPlan } from '../services/profile';
import {
  deriveGoals,
  finishFitnessProfile,
  fitnessProfileSchema,
  onboardingSteps,
  saveFitnessDraft,
  skipFitnessOnboarding,
  validateFitnessStep,
} from '@/features/profile/services/fitnessProfile';
export function useFitnessOnboarding() {
  const { data } = useData();
  const save = useSave();
  const persist = save.mutateAsync;
  const [profile, setProfile] = useState<FitnessProfile>(
    () => data!.fitnessProfile,
  );
  const [step, setStep] = useState<FitnessStep>(() =>
    data!.fitnessProfile.onboarding.status === 'complete'
      ? 'interests'
      : onboardingSteps(data!.fitnessProfile).includes(
            data!.fitnessProfile.onboarding.step,
          )
        ? data!.fitnessProfile.onboarding.step
        : 'interests',
  );
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const revision = useRef(0);
  const latest = useRef({ profile, step });
  useEffect(() => {
    latest.current = { profile, step };
  }, [profile, step]);
  const steps = onboardingSteps(profile);
  const current = steps.includes(step) ? step : 'interests';
  useEffect(() => {
    if (!dirty || !fitnessProfileSchema.safeParse(profile).success) return;
    let active = true;
    const expected = revision.current;
    const timer = setTimeout(() => {
      setSavingDraft(true);
      void persist((d) =>
        revision.current === expected
          ? saveFitnessDraft(d, profile, current)
          : d,
      )
        .then(() => {
          if (active) setError('');
        })
        .catch(() => {
          if (active)
            setError(
              'Couldn’t save your progress. Keep this screen open and try Continue again.',
            );
        })
        .finally(() => {
          if (active) setSavingDraft(false);
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [profile, current, dirty, persist]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      const value = latest.current;
      if (
        state !== 'active' &&
        fitnessProfileSchema.safeParse(value.profile).success
      )
        void persist((d) =>
          saveFitnessDraft(d, value.profile, value.step),
        ).catch(() => undefined);
    });
    return () => listener.remove();
  }, [persist]);
  function update(patch: Partial<FitnessProfile>): void {
    revision.current++;
    setProfile((previous) => {
      const next = { ...previous, ...patch };
      if (
        patch.training ||
        patch.interests ||
        patch.experience ||
        patch.guidance ||
        patch.eligibility
      )
        next.onboarding = { ...next.onboarding, planDraft: undefined };
      if (next.interests.includes('training'))
        next.training = {
          ...(next.training ?? defaultPreferences),
          experience: next.experience,
          guidance: next.guidance,
        };
      if (next.eligibility === 'under18' || next.eligibility === 'unspecified')
        next.metrics = {};
      return { ...next, goals: deriveGoals(next) };
    });
    setDirty(true);
    setError('');
  }
  function training(patch: Partial<TrainingPreferences>): void {
    update({
      training: {
        ...(profile.training ?? {
          ...defaultPreferences,
          experience: profile.experience,
          guidance: profile.guidance,
        }),
        ...patch,
      },
    });
  }
  async function next(override = profile): Promise<void> {
    revision.current++;
    const invalid = validateFitnessStep(override, current);
    if (invalid) {
      setError(invalid);
      return;
    }
    const path = onboardingSteps(override);
    const following =
      path[Math.min(path.indexOf(current) + 1, path.length - 1)];
    try {
      await persist((d) => saveFitnessDraft(d, override, following));
      setProfile(override);
      setStep(following);
      setDirty(false);
      setSavingDraft(false);
      setError('');
    } catch {
      setError('Couldn’t save your progress. Please try again.');
    }
  }
  async function back(): Promise<void> {
    revision.current++;
    const previous = steps[Math.max(0, steps.indexOf(current) - 1)];
    if (fitnessProfileSchema.safeParse(profile).success) {
      try {
        await persist((d) => saveFitnessDraft(d, profile, previous));
      } catch {
        setError('Couldn’t save progress. Try again.');
        return;
      }
    }
    setStep(previous);
    setDirty(false);
    setError('');
  }
  async function finish(withPlan = false): Promise<void> {
    revision.current++;
    try {
      await persist((d) => {
        const complete = finishFitnessProfile(d, profile);
        const draft = profile.onboarding.planDraft;
        return withPlan && draft && profile.training
          ? acceptPlan(complete, profile.training, draft, draft.id)
          : complete;
      });
      setDirty(false);
      setSavingDraft(false);
      router.dismissTo('/');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Couldn’t finish setup. Please try again.',
      );
    }
  }
  async function explore(): Promise<void> {
    revision.current++;
    try {
      const safe = fitnessProfileSchema.safeParse(profile);
      await persist((d) => {
        const saved = safe.success ? safe.data : d.fitnessProfile;
        return skipFitnessOnboarding(d, {
          ...saved,
          onboarding: { ...saved.onboarding, step: current },
        });
      });
      setDirty(false);
      setSavingDraft(false);
      router.dismissTo('/');
    } catch {
      setError('Couldn’t save your progress. Try again.');
    }
  }
  function recommend(): void {
    if (!profile.training) return;
    try {
      const plan = generatePlan(profile.training);
      update({
        onboarding: {
          ...profile.onboarding,
          planDraft: { ...plan, id: uid() },
        },
      });
    } catch {
      setError('Check your training preferences before generating a plan.');
    }
  }
  function updateRoutine(
    index: number,
    updater: (routine: Routine) => Routine,
  ): void {
    const draft = profile.onboarding.planDraft;
    if (draft)
      update({
        onboarding: {
          ...profile.onboarding,
          planDraft: {
            ...draft,
            routines: draft.routines.map((r, i) =>
              i === index ? updater(r) : r,
            ),
          },
        },
      });
  }
  return {
    profile,
    current,
    steps,
    update,
    training,
    next,
    back,
    finish,
    explore,
    recommend,
    updateRoutine,
    error,
    pending: save.isPending,
    savingDraft,
  };
}
