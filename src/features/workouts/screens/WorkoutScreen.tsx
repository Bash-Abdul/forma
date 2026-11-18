import { useTheme } from '@/theme/provider';
import { useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Plus, X } from 'lucide-react-native';
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
import { exerciseById } from '@/mocks/exercises';
import { LoggedSet, Workout } from '@/types';
import { uid, validSet, volume } from '@/lib/training';

import { finishWorkout } from '../services/session';
export default function WorkoutScreen() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData();
  const save = useSave();
  const [error, setError] = useState('');
  const workout = id ? data?.workouts.find((w) => w.id === id) : data?.active;
  const readOnly = !!id;
  if (!data || !workout)
    return (
      <Screen>
        <Back />
        <Heading
          title="No workout here yet"
          detail="Start a session from one of your routines."
        />
        <Button
          label="View routines"
          onPress={() => router.replace('/routines')}
        />
      </Screen>
    );
  const persist = (transform: (w: Workout) => Workout) => {
    setError('');
    save.mutate(
      (d) => ({
        ...d,
        active: d.active?.id === workout.id ? transform(d.active) : d.active,
      }),
      {
        onError: () =>
          setError('Couldn’t save your changes. Please try again.'),
      },
    );
  };
  function updateSet(ei: number, si: number, patch: Partial<LoggedSet>) {
    persist((w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i === ei
          ? {
              ...e,
              sets: e.sets.map((set, j) =>
                j === si ? { ...set, ...patch } : set,
              ),
            }
          : e,
      ),
    }));
  }
  const completed = workout.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0,
  );
  const total = workout.exercises.reduce((n, e) => n + e.sets.length, 0);
  const finish = async () => {
    if (!completed) {
      setError('Complete at least one set before finishing.');
      return;
    }
    try {
      await save.mutateAsync((d) => finishWorkout(d, workout.id));
      router.replace({ pathname: '/workout', params: { id: workout.id } });
    } catch {
      setError(
        'Couldn’t finish your workout. Your session is still available.',
      );
    }
  };
  const discard = () => {
    const run = () =>
      void save
        .mutateAsync((d) => ({ ...d, active: null }))
        .then(() => router.replace('/routines'))
        .catch(() => setError('Couldn’t discard. Try again.'));
    if (Platform.OS === 'web') {
      if (window.confirm('Discard this workout? Logged sets will be deleted.'))
        run();
    } else
      Alert.alert('Discard workout?', 'Logged sets will be deleted.', [
        { text: 'Keep training', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: run },
      ]);
  };
  return (
    <Screen>
      <Back label={readOnly ? 'Workout history' : 'Keep session & go back'} />
      <Heading
        eyebrow={
          readOnly
            ? data.demoRecords?.workoutIds.includes(workout.id)
              ? 'EXAMPLE SESSION'
              : 'SESSION COMPLETE'
            : 'LET’S PUT IN THE WORK'
        }
        title={workout.name}
        detail={`${new Date(workout.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${readOnly ? `${Math.max(1, Math.round((new Date(workout.finishedAt!).getTime() - new Date(workout.startedAt).getTime()) / 60000))} min` : 'Your session is saved on this device'}`}
      />
      <Card style={{ backgroundColor: c.pale }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.small}>Completed sets</Text>
            <Text style={s.metric}>
              {completed}
              <Text style={s.small}> / {total}</Text>
            </Text>
          </View>
          <View>
            <Text style={s.small}>Training volume</Text>
            <Text style={s.metric}>
              {volume(workout).toLocaleString()}
              <Text style={s.small}> kg</Text>
            </Text>
          </View>
        </View>
      </Card>
      {workout.exercises.map((entry, ei) => {
        const exercise = exerciseById(entry.exerciseId);
        const previous = [...data.workouts]
          .reverse()
          .filter(
            (w) =>
              !data.demoRecords?.workoutIds.includes(w.id) &&
              w.id !== id &&
              new Date(w.startedAt) < new Date(workout.startedAt),
          )
          .flatMap((w) => w.exercises)
          .find((e) => e.exerciseId === entry.exerciseId);
        return (
          <Card key={`${entry.exerciseId}-${ei}`}>
            <Text style={s.sectionTitle}>
              {ei + 1}. {exercise.name}
            </Text>
            <Text style={s.small}>
              {exercise.muscle} · Target {entry.minReps}–{entry.maxReps}{' '}
              {entry.exerciseId === 'plank' ? 'seconds' : 'reps'}
            </Text>
            <Text style={s.small}>
              Previous:{' '}
              {previous
                ? previous.sets
                    .map((set) => `${set.weight} kg × ${set.reps}`)
                    .join(' · ')
                : 'Your first session for this exercise'}
            </Text>
            {entry.sets.map((set, si) => (
              <View key={set.id} style={[s.row, { alignItems: 'flex-end' }]}>
                <Text style={[s.small, { width: 16, marginBottom: 15 }]}>
                  {si + 1}
                </Text>
                {readOnly ? (
                  <Text style={[s.rowTitle, { flex: 1, paddingVertical: 12 }]}>
                    {set.weight} kg × {set.reps}{' '}
                    {entry.exerciseId === 'plank' ? 'sec' : 'reps'}
                  </Text>
                ) : (
                  <>
                    <Field
                      label={si === 0 ? 'Weight (kg)' : 'kg'}
                      value={set.weight}
                      editable={!set.completed}
                      keyboardType="decimal-pad"
                      onChangeText={(v) =>
                        updateSet(ei, si, { weight: v.replace(',', '.') })
                      }
                    />
                    <Field
                      label={entry.exerciseId === 'plank' ? 'Seconds' : 'Reps'}
                      value={set.reps}
                      editable={!set.completed}
                      keyboardType="number-pad"
                      onChangeText={(v) => updateSet(ei, si, { reps: v })}
                    />
                  </>
                )}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: set.completed,
                    disabled: readOnly,
                  }}
                  accessibilityLabel={`${exercise.name} set ${si + 1} complete`}
                  disabled={readOnly || save.isPending}
                  onPress={() => {
                    if (!set.completed && !validSet(set.weight, set.reps)) {
                      setError(
                        'Enter a weight of 0 or more and 1–999 reps before completing a set.',
                      );
                      return;
                    }
                    updateSet(ei, si, { completed: !set.completed });
                  }}
                  style={{
                    height: 46,
                    width: 36,
                    backgroundColor: set.completed ? c.primary : c.pale,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check
                    size={18}
                    color={set.completed ? c.onPrimary : c.primary}
                  />
                </Pressable>
                {!readOnly ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove set ${si + 1}`}
                    disabled={save.isPending}
                    onPress={() =>
                      persist((w) => ({
                        ...w,
                        exercises: w.exercises.map((e, i) =>
                          i === ei
                            ? {
                                ...e,
                                sets: e.sets.filter((s) => s.id !== set.id),
                              }
                            : e,
                        ),
                      }))
                    }
                    style={{ paddingVertical: 14 }}
                  >
                    <X size={16} color={c.muted} />
                  </Pressable>
                ) : null}
              </View>
            ))}
            {!readOnly ? (
              <Button
                secondary
                label="Add set"
                icon={<Plus size={16} color={c.primary} />}
                disabled={save.isPending}
                onPress={() =>
                  persist((w) => ({
                    ...w,
                    exercises: w.exercises.map((e, i) =>
                      i === ei
                        ? {
                            ...e,
                            sets: [
                              ...e.sets,
                              {
                                id: uid(),
                                weight: '',
                                reps: '',
                                completed: false,
                              },
                            ],
                          }
                        : e,
                    ),
                  }))
                }
              />
            ) : null}
          </Card>
        );
      })}
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      {!readOnly ? (
        <>
          <Text style={s.small}>
            Finish saves completed sets only. Unfinished sets are left out of
            your history.
          </Text>
          <Button
            label={save.isPending ? 'Saving…' : 'Finish & save workout'}
            disabled={save.isPending}
            onPress={() => void finish()}
          />
          <Button
            secondary
            label="Discard workout"
            disabled={save.isPending}
            onPress={discard}
          />
        </>
      ) : (
        <Button label="Back to home" onPress={() => router.replace('/')} />
      )}
    </Screen>
  );
}
