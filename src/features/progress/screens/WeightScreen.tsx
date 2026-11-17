import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Back, Button, Card, Field, Heading, Screen, s } from '@/components/ui';
import { useSave } from '@/lib/store';
import { uid } from '@/lib/training';
const schema = z.object({
  weight: z
    .string()
    .refine(
      (v) =>
        v.trim() !== '' &&
        Number.isFinite(Number(v)) &&
        Number(v) >= 20 &&
        Number(v) <= 500,
      'Enter a weight between 20 and 500 kg.',
    ),
});
export default function WeightScreen() {
  const save = useSave();
  const [error, setError] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { weight: '' },
  });
  const submit = handleSubmit(async ({ weight }) => {
    try {
      await save.mutateAsync((d) => ({
        ...d,
        weights: [
          ...d.weights,
          { id: uid(), date: new Date().toISOString(), kg: Number(weight) },
        ],
      }));
      router.back();
    } catch {
      setError('Couldn’t save your weight. Please try again.');
    }
  });
  return (
    <Screen>
      <Back />
      <Heading
        eyebrow="A SMALL CHECK-IN"
        title="Log your weight"
        detail="One measurement, part of a bigger picture."
      />
      <Card>
        <Controller
          control={control}
          name="weight"
          render={({ field: { value, onChange } }) => (
            <Field
              label="Body weight (kg)"
              placeholder="e.g. 77.8"
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
