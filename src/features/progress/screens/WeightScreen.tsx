import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Back,
  Button,
  Card,
  Field,
  Heading,
  Screen,
  useUiStyles,
} from '@/components/ui';
import { useData, useSave } from '@/lib/store';
import { uid } from '@/lib/training';
import {
  toKg,
  weightUnit,
  Units,
} from '@/features/profile/services/measurements';
const schema = (units: Units) =>
  z.object({
    weight: z
      .string()
      .refine(
        (v) =>
          v.trim() !== '' &&
          Number.isFinite(Number(v)) &&
          toKg(Number(v), units) >= 20 &&
          toKg(Number(v), units) <= 500,
        units === 'metric'
          ? 'Enter a weight between 20 and 500 kg.'
          : 'Enter a weight between 44.1 and 1102.3 lb.',
      ),
  });
export default function WeightScreen() {
  const s = useUiStyles();

  const save = useSave();
  const { data } = useData();
  const units = data?.fitnessProfile.units ?? 'metric';
  const [error, setError] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<ReturnType<typeof schema>>>({
    resolver: zodResolver(schema(units)),
    defaultValues: { weight: '' },
  });
  const submit = handleSubmit(async ({ weight }) => {
    try {
      await save.mutateAsync((d) => ({
        ...d,
        weights: [
          ...d.weights,
          {
            id: uid(),
            date: new Date().toISOString(),
            kg: toKg(Number(weight), units),
          },
        ],
      }));
      if (router.canGoBack()) router.back();
      else router.replace('/progress');
    } catch {
      setError('Couldn’t save your weight. Please try again.');
    }
  });
  return (
    <Screen>
      <Back />
      <Heading
        title="Log your weight"
        detail="One measurement, part of a bigger picture."
      />
      <Card>
        <Controller
          control={control}
          name="weight"
          render={({ field: { value, onChange } }) => (
            <Field
              label={`Body weight (${weightUnit(units)})`}
              placeholder={units === 'metric' ? 'e.g. 77.8' : 'e.g. 171.5'}
              keyboardType="decimal-pad"
              value={value}
              onChangeText={(v) => onChange(v.replace(',', '.'))}
            />
          )}
        />
        {errors.weight ? (
          <Text style={s.error}>{errors.weight.message}</Text>
        ) : null}
        <Text style={s.small}>
          Recorded for{' '}
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
          })}
          . For consistent readings, use the same scale at a similar time of
          day.
        </Text>
      </Card>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button
        label={save.isPending ? 'Saving…' : 'Save weight'}
        disabled={save.isPending}
        onPress={() => void submit()}
      />
    </Screen>
  );
}
