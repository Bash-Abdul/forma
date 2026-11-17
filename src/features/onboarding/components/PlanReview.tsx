import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react-native';
import { Button, Card, Chip, Field, s } from '@/components/ui';
import { ChoiceSheet } from '@/components/ui/ChoiceSheet';
import { exerciseById } from '@/mocks/exercises';
import { Routine, TrainingPreferences } from '@/types';
import { colors as c } from '@/theme';
import { availableExercises, GeneratedPlan } from '../services/generator';
type Props = {
  plan: GeneratedPlan;
  preferences: TrainingPreferences;
  onUpdate: (index: number, update: (routine: Routine) => Routine) => void;
};
export function PlanReview({ plan, preferences, onUpdate }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [picker, setPicker] = useState<{
    routine: number;
    exercise: number | null;
  } | null>(null);
  const candidates = availableExercises(preferences).filter(
    (e) =>
      picker &&
      !plan.routines[picker.routine].exercises.some(
        (entry, index) =>
          entry.exerciseId === e.id && index !== picker.exercise,
      ),
  );
  return (
    <>
      <Card style={{ backgroundColor: c.pale, borderWidth: 0 }}>
        <Text style={s.sectionTitle}>{plan.title}</Text>
        {plan.explanation.map((reason, index) => (
          <Text key={index} style={s.body}>
            {reason}
          </Text>
        ))}
      </Card>
      <Text style={s.body}>
        Adjust names, training days, exercises and targets below. Accepting adds
        these routines alongside your existing ones.
      </Text>
      {plan.routines.map((routine, ri) => (
        <Card key={routine.id}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Customise ${routine.name}`}
            accessibilityState={{ expanded: expanded === ri }}
            onPress={() => setExpanded(expanded === ri ? null : ri)}
            style={[s.row, { minHeight: 48 }]}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.sectionTitle}>
                {routine.name || `Session ${ri + 1}`}
              </Text>
              <Text style={s.small}>
                {
                  [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ][routine.day - 1]
                }{' '}
                · {routine.exercises.length} exercises ·{' '}
                {routine.exercises.reduce((n, e) => n + e.sets, 0)} sets
              </Text>
            </View>
            <ChevronDown
              size={18}
              color={c.primary}
              style={{
                transform: [{ rotate: expanded === ri ? '180deg' : '0deg' }],
              }}
            />
          </Pressable>
          {expanded !== ri ? (
            <>
              <Text style={s.body}>
                {routine.exercises
                  .map((e) => exerciseById(e.exerciseId).name)
                  .join(' · ') || 'No exercises — open to add a movement.'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setExpanded(ri)}
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={s.link}>Customise session</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Field
                label={`Session ${ri + 1} name`}
                value={routine.name}
                maxLength={60}
                onChangeText={(name) => onUpdate(ri, (r) => ({ ...r, name }))}
              />
              <View style={{ gap: 8 }}>
                <Text style={s.label}>Training day</Text>
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                    (day, i) => (
                      <Chip
                        key={day}
                        label={day}
                        selected={routine.day === i + 1}
                        onPress={() =>
                          onUpdate(ri, (r) => ({ ...r, day: i + 1 }))
                        }
                      />
                    ),
                  )}
                </View>
              </View>
              {routine.exercises.map((entry, ei) => (
                <View
                  key={`${entry.exerciseId}-${ei}`}
                  style={{
                    gap: 12,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: c.line,
                  }}
                >
                  <Text style={s.rowTitle}>
                    {ei + 1}. {exerciseById(entry.exerciseId).name}
                  </Text>
                  <View style={s.row}>
                    <Field
                      label="Sets"
                      keyboardType="number-pad"
                      value={String(entry.sets || '')}
                      onChangeText={(v) =>
                        onUpdate(ri, (r) => ({
                          ...r,
                          exercises: r.exercises.map((e, i) =>
                            i === ei ? { ...e, sets: Number(v) } : e,
                          ),
                        }))
                      }
                    />
                    <Field
                      label={
                        entry.exerciseId === 'plank' ? 'Min sec' : 'Min reps'
                      }
                      keyboardType="number-pad"
                      value={String(entry.minReps || '')}
                      onChangeText={(v) =>
                        onUpdate(ri, (r) => ({
                          ...r,
                          exercises: r.exercises.map((e, i) =>
                            i === ei ? { ...e, minReps: Number(v) } : e,
                          ),
                        }))
                      }
                    />
                    <Field
                      label={
                        entry.exerciseId === 'plank' ? 'Max sec' : 'Max reps'
                      }
                      keyboardType="number-pad"
                      value={String(entry.maxReps || '')}
                      onChangeText={(v) =>
                        onUpdate(ri, (r) => ({
                          ...r,
                          exercises: r.exercises.map((e, i) =>
                            i === ei ? { ...e, maxReps: Number(v) } : e,
                          ),
                        }))
                      }
                    />
                  </View>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                  >
                    <Button
                      secondary
                      label="Swap"
                      onPress={() => setPicker({ routine: ri, exercise: ei })}
                    />
                    <Button
                      secondary
                      label="Up"
                      disabled={ei === 0}
                      icon={<ArrowUp size={14} color={c.primary} />}
                      onPress={() =>
                        onUpdate(ri, (r) => {
                          const entries = [...r.exercises];
                          [entries[ei], entries[ei - 1]] = [
                            entries[ei - 1],
                            entries[ei],
                          ];
                          return { ...r, exercises: entries };
                        })
                      }
                    />
                    <Button
                      secondary
                      label="Down"
                      disabled={ei === routine.exercises.length - 1}
                      icon={<ArrowDown size={14} color={c.primary} />}
                      onPress={() =>
                        onUpdate(ri, (r) => {
                          const entries = [...r.exercises];
                          [entries[ei], entries[ei + 1]] = [
                            entries[ei + 1],
                            entries[ei],
                          ];
                          return { ...r, exercises: entries };
                        })
                      }
                    />
                    <Button
                      secondary
                      label="Remove"
                      onPress={() =>
                        onUpdate(ri, (r) => ({
                          ...r,
                          exercises: r.exercises.filter((_, i) => i !== ei),
                        }))
                      }
                    />
                  </View>
                </View>
              ))}
              <Button
                secondary
                label="Add exercise"
                onPress={() => setPicker({ routine: ri, exercise: null })}
              />
            </>
          )}
        </Card>
      ))}
      <ChoiceSheet
        visible={!!picker}
        title="Choose an exercise"
        value={
          picker?.exercise !== null && picker
            ? plan.routines[picker.routine].exercises[picker.exercise]
                .exerciseId
            : ''
        }
        options={candidates.map((e) => ({
          value: e.id,
          label: e.name,
          detail: `${e.muscle} · ${e.equipment}`,
        }))}
        onClose={() => setPicker(null)}
        onSelect={(id) => {
          if (!picker) return;
          const { routine, exercise } = picker;
          onUpdate(routine, (r) => ({
            ...r,
            exercises:
              exercise === null
                ? [
                    ...r.exercises,
                    {
                      exerciseId: id,
                      sets: 2,
                      minReps: id === 'plank' ? 20 : 8,
                      maxReps: id === 'plank' ? 40 : 12,
                    },
                  ]
                : r.exercises.map((e, i) =>
                    i === exercise
                      ? {
                          ...e,
                          exerciseId: id,
                          minReps: id === 'plank' ? 20 : 8,
                          maxReps: id === 'plank' ? 40 : 12,
                        }
                      : e,
                  ),
          }));
        }}
      />
    </>
  );
}
