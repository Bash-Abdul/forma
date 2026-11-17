import { useState } from 'react';
import { useForm, FieldPathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useData, useSave } from '@/lib/store';
import { TrainingPreferences, Routine } from '@/types';
import { uid } from '@/lib/training';
import { GeneratedPlan, generatePlan } from '../services/generator';
import { defaultPreferences, preferencesSchema } from '../services/preferences';
import {
  acceptPlan,
  savePreferences,
  skipOnboarding,
} from '../services/profile';
export function useOnboarding() {
  const { data } = useData();
  const save = useSave();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [acceptanceId, setAcceptanceId] = useState('');
  const [error, setError] = useState('');
  const form = useForm<TrainingPreferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: data?.onboarding?.preferences ?? defaultPreferences,
  });
  const values = form.watch();
  function setPreference<K extends keyof TrainingPreferences>(
    key: K,
    value: TrainingPreferences[K],
  ): void {
    form.setValue(key, value as FieldPathValue<TrainingPreferences, K>, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setError('');
  }
  async function next(): Promise<void> {
    if (step === 2 && !(await form.trigger('equipment'))) return;
    setError('');
    setStep((current) => Math.min(3, current + 1));
  }
  const generate = form.handleSubmit((p) => {
    setPlan(generatePlan(p));
    setAcceptanceId(uid());
    setError('');
  });
  const saveOnly = form.handleSubmit(async (p) => {
    try {
      await save.mutateAsync((d) => savePreferences(d, p));
      router.replace({
        pathname: '/profile',
        params: { saved: 'preferences' },
      });
    } catch {
      setError(
        'Couldn’t save preferences. Your existing data is unchanged. Try again.',
      );
    }
  });
  async function accept(): Promise<void> {
    if (!plan || save.isPending) return;
    try {
      await save.mutateAsync((d) => acceptPlan(d, values, plan, acceptanceId));
      router.replace({ pathname: '/profile', params: { saved: 'plan' } });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Couldn’t save this plan. Please try again.',
      );
    }
  }
  async function skip(): Promise<void> {
    try {
      await save.mutateAsync(skipOnboarding);
      router.replace(data?.onboarding?.preferences ? '/profile' : '/');
    } catch {
      setError('Couldn’t save your choice. Please try again.');
    }
  }
  function updateRoutine(
    index: number,
    update: (routine: Routine) => Routine,
  ): void {
    setPlan((current) =>
      current
        ? {
            ...current,
            routines: current.routines.map((r, i) =>
              i === index ? update(r) : r,
            ),
          }
        : null,
    );
    setError('');
  }
  return {
    values,
    configured: !!data?.onboarding?.preferences,
    setPreference,
    step,
    setStep,
    next,
    plan,
    updateRoutine,
    backToPreferences: () => {
      setPlan(null);
      setError('');
    },
    generate,
    saveOnly,
    accept,
    skip,
    error,
    pending: save.isPending,
    equipmentError: form.formState.errors.equipment?.message,
  };
}
