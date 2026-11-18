import { useTheme } from '@/theme/provider';
import { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react-native';
import {
  Back,
  Button,
  Card,
  Chip,
  Field,
  Heading,
  Screen,
  useUiStyles,
} from '@/components/ui';
import { useData, useSave } from '@/lib/store';
import { exercises, exerciseById } from '@/mocks/exercises';
import { PlannedExercise } from '@/types';
import { adoptRoutine, uid } from '@/lib/training';

import { validatePlan } from '../utils/validation';
const schema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters.').max(60),
  subtitle: z.string().trim().max(100),
});
type Values = z.infer<typeof schema>;
export default function RoutineEditor() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData();
  const save = useSave();
  const original = data?.routines.find((r) => r.id === id);
  const [items, setItems] = useState<PlannedExercise[]>(
    original?.exercises ?? [],
  );
  const [day, setDay] = useState(original?.day ?? 1);
  const [picker, setPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: original?.name ?? '',
      subtitle: original?.subtitle ?? '',
    },
  });
  function update(index: number, patch: Partial<PlannedExercise>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  function move(index: number, offset: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }
  const submit = handleSubmit(async (values) => {
    const validation = validatePlan(items);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      const routine = {
        ...values,
        id: original?.id ?? uid(),
        day,
        exercises: items,
      };
      await save.mutateAsync((d) => ({
        ...adoptRoutine(d, routine.id),
        routines: original
          ? d.routines.map((r) => (r.id === id ? routine : r))
          : [...d.routines, routine],
      }));
      router.back();
    } catch {
      setError('Couldn’t save your routine. Please try again.');
    }
  });
  const remove = () => {
    const run = () =>
      void save
        .mutateAsync((d) => ({
          ...d,
          routines: d.routines.filter((r) => r.id !== id),
        }))
        .then(() => router.back())
        .catch(() => setError('Couldn’t delete. Try again.'));
    if (Platform.OS === 'web') {
      if (
        window.confirm('Delete this routine? Completed workouts will be kept.')
      )
        run();
    } else
      Alert.alert('Delete routine?', 'Completed workouts will be kept.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: run },
      ]);
  };
  if (id && !original)
    return (
      <Screen>
        <Back />
        <Heading title="Routine not found" />
      </Screen>
    );
  return (
    <Screen>
      <Back label="Routines" />
      <Heading
        eyebrow="BUILD YOUR TRAINING"
        title={original ? 'Edit routine' : 'New routine'}
        detail="A reusable plan for your next session."
      />
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Routine name"
            placeholder="e.g. Upper body A"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name ? <Text style={s.error}>{errors.name.message}</Text> : null}
      <Controller
        control={control}
        name="subtitle"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Focus / description"
            placeholder="e.g. Chest, back & shoulders"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.subtitle ? (
        <Text style={s.error}>{errors.subtitle.message}</Text>
      ) : null}
      <Text style={s.label}>Scheduled day</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <Chip
            key={d}
            label={d}
            selected={day === i + 1}
            onPress={() => setDay(i + 1)}
          />
        ))}
      </View>
      <Text style={s.sectionTitle}>Exercises · {items.length}</Text>
      {items.map((item, index) => (
        <Card key={item.exerciseId}>
          <Text style={s.rowTitle}>
            {index + 1}. {exerciseById(item.exerciseId).name}
          </Text>
          <View style={s.row}>
            <Field
              label="Sets"
              keyboardType="number-pad"
              value={String(item.sets || '')}
              onChangeText={(v) => update(index, { sets: Number(v) })}
            />
            <Field
              label="Min reps"
              keyboardType="number-pad"
              value={String(item.minReps || '')}
              onChangeText={(v) => update(index, { minReps: Number(v) })}
            />
            <Field
              label="Max reps"
              keyboardType="number-pad"
              value={String(item.maxReps || '')}
              onChangeText={(v) => update(index, { maxReps: Number(v) })}
            />
          </View>
          <View style={[s.row, { flexWrap: 'wrap' }]}>
            <Button
              label="Up"
              secondary
              disabled={index === 0}
              onPress={() => move(index, -1)}
              icon={<ArrowUp size={14} color={c.primary} />}
            />
            <Button
              label="Down"
              secondary
              disabled={index === items.length - 1}
              onPress={() => move(index, 1)}
              icon={<ArrowDown size={14} color={c.primary} />}
            />
            <Button
              label="Remove"
              secondary
              onPress={() => setItems(items.filter((_, i) => i !== index))}
            />
          </View>
        </Card>
      ))}
      <Button
        secondary
        label="Add exercise"
        icon={<Plus size={18} color={c.primary} />}
        onPress={() => setPicker(true)}
      />
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      <Button
        label={save.isPending ? 'Saving…' : 'Save routine'}
        disabled={save.isPending}
        onPress={() => void submit()}
      />
      {original ? (
        <Button
          label="Delete routine"
          secondary
          onPress={remove}
          icon={<Trash2 size={16} color={c.danger} />}
        />
      ) : null}
      <Modal
        visible={picker}
        animationType="slide"
        onRequestClose={() => setPicker(false)}
      >
        <Screen>
          <Heading title="Add an exercise" />
          <Field
            label="Search library"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView contentContainerStyle={{ gap: 12 }}>
            {exercises
              .filter(
                (e) =>
                  e.name.toLowerCase().includes(search.toLowerCase()) &&
                  !items.some((i) => i.exerciseId === e.id),
              )
              .map((e) => (
                <Button
                  key={e.id}
                  label={`${e.name} +`}
                  secondary
                  onPress={() => {
                    setItems((current) => [
                      ...current,
                      { exerciseId: e.id, sets: 3, minReps: 8, maxReps: 12 },
                    ]);
                    setPicker(false);
                    setSearch('');
                  }}
                />
              ))}
          </ScrollView>
          <Button label="Done" onPress={() => setPicker(false)} />
        </Screen>
      </Modal>
    </Screen>
  );
}
